'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth';
import { serviceSchema, updateServiceStatusSchema } from '@/lib/validators';
import { canWrite, canAdmin } from '@/lib/utils';
import { writeAuditLog } from './audit';

type ActionResult = {
  success: boolean;
  errors?: Record<string, string[]>;
};

// ─── Create Service ──────────────────────────────────────────────────────────

/**
 * Creates a new service within the authenticated user's organization.
 *
 * Automatically assigns sortOrder = max(existing) + 1 so newly created
 * services appear at the bottom of the list by default.
 */
export async function createServiceAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    if (!canWrite(session.user.role)) {
      return {
        success: false,
        errors: { _form: ['You do not have permission to create services.'] },
      };
    }

    // ── Validate input ───────────────────────────────────────────────────
    const rawInput = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || '',
      status: formData.get('status') as string,
    };

    const parsed = serviceSchema.safeParse(rawInput);
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

    const { name, description, status } = parsed.data;
    const orgId = session.user.orgId;

    // ── Determine sort order ─────────────────────────────────────────────
    const maxSortOrder = await prisma.service.aggregate({
      _max: { sortOrder: true },
      where: { orgId, deletedAt: null },
    });
    const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    // ── Create the service ───────────────────────────────────────────────
    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        status,
        sortOrder: nextSortOrder,
        orgId,
      },
    });

    // ── Audit trail ──────────────────────────────────────────────────────
    await writeAuditLog({
      action: 'create',
      entityType: 'service',
      entityId: service.id,
      metadata: { name, status },
      userId: session.user.id,
      orgId,
    });

    // ── Revalidate affected pages ────────────────────────────────────────
    revalidatePath('/dashboard/services');
    revalidatePath(`/status/${session.user.orgSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Create service action error:', error);
    return {
      success: false,
      errors: { _form: ['Something went wrong'] },
    };
  }
}

// ─── Update Service Status ───────────────────────────────────────────────────

/**
 * Updates only the status of an existing service.
 *
 * This is the most common mutation — triggered from quick-toggle controls
 * on the dashboard. Validates ownership before allowing the change.
 */
export async function updateServiceStatusAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    if (!canWrite(session.user.role)) {
      return {
        success: false,
        errors: { _form: ['You do not have permission to update services.'] },
      };
    }

    // ── Validate input ───────────────────────────────────────────────────
    const rawInput = {
      serviceId: formData.get('serviceId') as string,
      status: formData.get('status') as string,
    };

    const parsed = updateServiceStatusSchema.safeParse(rawInput);
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

    const { serviceId, status } = parsed.data;
    const orgId = session.user.orgId;

    // ── Verify service belongs to this org ────────────────────────────────
    const service = await prisma.service.findFirst({
      where: { id: serviceId, orgId, deletedAt: null },
    });

    if (!service) {
      return {
        success: false,
        errors: { _form: ['Service not found.'] },
      };
    }

    const previousStatus = service.status;

    // ── Update status ────────────────────────────────────────────────────
    await prisma.service.update({
      where: { id: serviceId },
      data: { status },
    });

    // ── Audit trail ──────────────────────────────────────────────────────
    await writeAuditLog({
      action: 'status_change',
      entityType: 'service',
      entityId: serviceId,
      metadata: { previousStatus, newStatus: status },
      userId: session.user.id,
      orgId,
    });

    // ── Revalidate affected pages ────────────────────────────────────────
    revalidatePath('/dashboard/services');
    revalidatePath(`/status/${session.user.orgSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Update service status action error:', error);
    return {
      success: false,
      errors: { _form: ['Something went wrong'] },
    };
  }
}

// ─── Update Service (Name/Description) ──────────────────────────────────────

/**
 * Updates a service's name and description.
 *
 * Uses the same serviceSchema for validation to keep things consistent.
 * Does not change status — use updateServiceStatusAction for that.
 */
export async function updateServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    if (!canWrite(session.user.role)) {
      return {
        success: false,
        errors: { _form: ['You do not have permission to update services.'] },
      };
    }

    // ── Validate input ───────────────────────────────────────────────────
    const serviceId = formData.get('serviceId') as string;
    if (!serviceId) {
      return {
        success: false,
        errors: { _form: ['Service ID is required.'] },
      };
    }

    const rawInput = {
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || '',
      status: formData.get('status') as string,
    };

    const parsed = serviceSchema.safeParse(rawInput);
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

    const { name, description } = parsed.data;
    const orgId = session.user.orgId;

    // ── Verify service belongs to this org ────────────────────────────────
    const service = await prisma.service.findFirst({
      where: { id: serviceId, orgId, deletedAt: null },
    });

    if (!service) {
      return {
        success: false,
        errors: { _form: ['Service not found.'] },
      };
    }

    // ── Update ───────────────────────────────────────────────────────────
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description: description || null,
      },
    });

    // ── Audit trail ──────────────────────────────────────────────────────
    await writeAuditLog({
      action: 'update',
      entityType: 'service',
      entityId: serviceId,
      metadata: { name, description: description || null },
      userId: session.user.id,
      orgId,
    });

    // ── Revalidate affected pages ────────────────────────────────────────
    revalidatePath('/dashboard/services');
    revalidatePath(`/status/${session.user.orgSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Update service action error:', error);
    return {
      success: false,
      errors: { _form: ['Something went wrong'] },
    };
  }
}

// ─── Delete Service (Soft Delete) ────────────────────────────────────────────

/**
 * Soft-deletes a service by setting deletedAt.
 *
 * Requires admin-level permissions. We never hard-delete services because
 * historical incident records reference them — soft-delete preserves
 * referential integrity while hiding the service from active views.
 */
export async function deleteServiceAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await requireSession();

    if (!canAdmin(session.user.role)) {
      return {
        success: false,
        errors: { _form: ['You do not have permission to delete services.'] },
      };
    }

    const serviceId = formData.get('serviceId') as string;
    if (!serviceId) {
      return {
        success: false,
        errors: { _form: ['Service ID is required.'] },
      };
    }

    const orgId = session.user.orgId;

    // ── Verify service belongs to this org ────────────────────────────────
    const service = await prisma.service.findFirst({
      where: { id: serviceId, orgId, deletedAt: null },
    });

    if (!service) {
      return {
        success: false,
        errors: { _form: ['Service not found.'] },
      };
    }

    // ── Soft delete ──────────────────────────────────────────────────────
    await prisma.service.update({
      where: { id: serviceId },
      data: { deletedAt: new Date() },
    });

    // ── Audit trail ──────────────────────────────────────────────────────
    await writeAuditLog({
      action: 'delete',
      entityType: 'service',
      entityId: serviceId,
      metadata: { name: service.name },
      userId: session.user.id,
      orgId,
    });

    // ── Revalidate affected pages ────────────────────────────────────────
    revalidatePath('/dashboard/services');
    revalidatePath(`/status/${session.user.orgSlug}`);

    return { success: true };
  } catch (error) {
    console.error('Delete service action error:', error);
    return {
      success: false,
      errors: { _form: ['Something went wrong'] },
    };
  }
}
