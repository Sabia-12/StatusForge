'use server';

import { prisma } from '@/lib/prisma';

interface WriteAuditLogParams {
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  userId: string;
  orgId: string;
}

/**
 * Writes an audit log entry to the database.
 *
 * Every mutation in the system should produce an audit trail entry
 * for accountability and debugging. Metadata is stored as a JSON
 * string to keep the schema flexible while remaining queryable.
 */
export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  const { action, entityType, entityId, metadata, userId, orgId } = params;

  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      userId,
      orgId,
    },
  });
}
