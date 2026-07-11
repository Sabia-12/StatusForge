'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { incidentSchema, incidentUpdateSchema } from '@/lib/validators';
import type { IncidentImpact, ServiceStatus } from '@/lib/validators';
import { canWrite } from '@/lib/utils';
import { writeAuditLog } from './audit';

type ActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
};

// ─── Impact → Service Status Mapping ─────────────────────────────────────────

/**
 * Maps incident impact levels to the service status that affected
 * services should be cascaded to. Only major/critical impacts cause
 * automatic service degradation — minor impacts are informational only.
 */
function getServiceStatusForImpact(impact: IncidentImpact): ServiceStatus | null {
  switch (impact) {
    case 'critical':
      return 'major_outage';
    case 'major':
      return 'partial_outage';
    case 'minor':
      return 'degraded';
    case 'none':
    default:
      return null;
  }
}

// ─── Create Incident ─────────────────────────────────────────────────────────

/**
 * Creates a new incident with linked services and an initial status update.
 *
 * This is the most complex action in the system because it handles:
 * 1. Incident creation
 * 2. Service linkage (IncidentService join table)
 * 3. Initial IncidentUpdate (the first status message)
 * 4. Cascading service status degradation (for major/critical impacts)
 *
 * Everything runs inside a single transaction so partial failures
 * don't leave the database in an inconsistent state.
 */
export async function createIncidentAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    if (!canWrite(session.user.role)) {
      return {
        success: false,
        errors: { _form: ['You do not have permission to create incidents.'] },
      };
    }

    // ── Validate input ───────────────────────────────────────────────────
    const rawInput = {
      title: formData.get('title') as string,
      impact: formData.get('impact') as string,
      status: formData.get('status') as string,
      serviceIds: formData.getAll('serviceIds') as string[],
      body: formData.get('body') as string,
    };

    const parsed = incidentSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string[]> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) {
          errors[field] = messages;
        }
      }
      return { success: false, errors };
    }

    const { title, impact, status, serviceIds, body } = parsed.data;
    const orgId = session.user.orgId;
    const userId = session.user.id;

    // ── Verify all services belong to this org ───────────────────────────
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        orgId,
        deletedAt: null,
      },
    });

    if (services.length !== serviceIds.length) {
      return {
        success: false,
        errors: { serviceIds: ['One or more selected services were not found.'] },
      };
    }

    // ── Transaction: create incident + links + update + cascade ──────────
    const incident = await prisma.$transaction(async (tx) => {
      // Create the incident
      const newIncident = await tx.incident.create({
        data: {
          title,
          status,
          impact,
          orgId,
          authorId: userId,
          resolvedAt: status === 'resolved' ? new Date() : null,
        },
      });

      // Create IncidentService links
      await tx.incidentService.createMany({
        data: serviceIds.map((serviceId) => ({
          incidentId: newIncident.id,
          serviceId,
        })),
      });

      // Create the initial status update
      await tx.incidentUpdate.create({
        data: {
          body,
          status,
          incidentId: newIncident.id,
          authorId: userId,
        },
      });

      // Cascade service statuses for non-resolved incidents with significant impact
      if (status !== 'resolved') {
        const cascadedStatus = getServiceStatusForImpact(impact as IncidentImpact);
        if (cascadedStatus) {
          await tx.service.updateMany({
            where: {
              id: { in: serviceIds },
              orgId,
              deletedAt: null,
            },
            data: { status: cascadedStatus },
          });
        }
      }

      return newIncident;
    });

    // ── Audit trail ──────────────────────────────────────────────────────
    await writeAuditLog({
      action: 'create',
      entityType: 'incident',
      entityId: incident.id,
      metadata: {
        title,
        impact,
        status,
        serviceIds,
      },
      userId,
      orgId,
    });

    // ── Revalidate affected pages ────────────────────────────────────────
    revalidatePath('/dashboard/incidents');
    revalidatePath('/dashboard/services');
    revalidatePath(`/status/${session.user.orgSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Create incident action error:', error);
    return {
      success: false,
      errors: { _form: ['Something went wrong'] },
    };
  }
}

// ─── Post Incident Update ────────────────────────────────────────────────────

/**
 * Posts a new status update to an existing incident.
 *
 * When the status is set to 'resolved':
 * 1. The incident's resolvedAt timestamp is set to now
 * 2. The incident's status is updated to 'resolved'
 * 3. ALL affected services are cascaded back to 'operational'
 *
 * This cascade-on-resolve ensures the public status page immediately
 * reflects the resolution without requiring manual service status updates.
 */
export async function postIncidentUpdateAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    if (!canWrite(session.user.role)) {
      return {
        success: false,
        errors: { _form: ['You do not have permission to update incidents.'] },
      };
    }

    // ── Validate input ───────────────────────────────────────────────────
    const rawInput = {
      incidentId: formData.get('incidentId') as string,
      body: formData.get('body') as string,
      status: formData.get('status') as string,
    };

    const parsed = incidentUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const errors: Record<string, string[]> = {};
      for (const [field, messages] of Object.entries(fieldErrors)) {
        if (messages && messages.length > 0) {
          errors[field] = messages;
        }
      }
      return { success: false, errors };
    }

    const { incidentId, body, status } = parsed.data;
    const orgId = session.user.orgId;
    const userId = session.user.id;

    // ── Verify incident belongs to this org ──────────────────────────────
    const incident = await prisma.incident.findFirst({
      where: { id: incidentId, orgId },
      include: {
        services: { select: { serviceId: true } },
      },
    });

    if (!incident) {
      return {
        success: false,
        errors: { _form: ['Incident not found.'] },
      };
    }

    const affectedServiceIds = incident.services.map((s) => s.serviceId);

    // ── Create update + handle resolution ────────────────────────────────
    await prisma.$transaction(async (tx) => {
      // Create the incident update
      await tx.incidentUpdate.create({
        data: {
          body,
          status,
          incidentId,
          authorId: userId,
        },
      });

      // If resolving, update the incident and cascade services to operational
      if (status === 'resolved') {
        await tx.incident.update({
          where: { id: incidentId },
          data: {
            status: 'resolved',
            resolvedAt: new Date(),
          },
        });

        // Cascade all affected services back to operational
        if (affectedServiceIds.length > 0) {
          await tx.service.updateMany({
            where: {
              id: { in: affectedServiceIds },
              orgId,
              deletedAt: null,
            },
            data: { status: 'operational' },
          });
        }
      } else {
        // Update incident status even if not resolving
        await tx.incident.update({
          where: { id: incidentId },
          data: { status },
        });
      }
    });

    // ── Audit trail ──────────────────────────────────────────────────────
    await writeAuditLog({
      action: 'update',
      entityType: 'incident_update',
      entityId: incidentId,
      metadata: {
        body,
        status,
        resolved: status === 'resolved',
      },
      userId,
      orgId,
    });

    // ── Revalidate affected pages ────────────────────────────────────────
    revalidatePath('/dashboard/incidents');
    revalidatePath(`/dashboard/incidents/${incidentId}`);
    revalidatePath('/dashboard/services');
    revalidatePath(`/status/${session.user.orgSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Post incident update action error:', error);
    return {
      success: false,
      errors: { _form: ['Something went wrong'] },
    };
  }
}
