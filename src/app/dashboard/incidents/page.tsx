import * as React from 'react';
import { Prisma } from '@prisma/client';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IncidentList } from '@/components/dashboard/incident-list';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: {
    q?: string;
    status?: string;
    page?: string;
  };
}

export default async function IncidentsPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const { orgId, role } = session.user;

  const query = searchParams.q || '';
  const filterStatus = searchParams.status || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 25;

  const whereClause: Prisma.IncidentWhereInput = {
    orgId,
    title: {
      contains: query,
    },
  };

  if (filterStatus) {
    whereClause.status = filterStatus;
  }

  const [incidents, totalCount, services] = await Promise.all([
    prisma.incident.findMany({
      where: whereClause,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.incident.count({
      where: whereClause,
    }),
    prisma.service.findMany({
      where: {
        orgId,
        deletedAt: null,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Incidents</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Track and report outages, maintenance, and service degradations.
          </p>
        </div>
      </div>

      <IncidentList
        initialIncidents={incidents}
        services={services}
        role={role}
        totalPages={totalPages}
        currentPage={page}
      />
    </div>
  );
}
