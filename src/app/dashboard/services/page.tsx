import * as React from 'react';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ServiceList } from '@/components/dashboard/service-list';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const session = await requireSession();
  const { orgId, role } = session.user;

  const services = await prisma.service.findMany({
    where: { orgId, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Services</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your organization&apos;s infrastructure resources and components.
          </p>
        </div>
      </div>
      <ServiceList initialServices={services} role={role} />
    </div>
  );
}
