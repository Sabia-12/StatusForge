import * as React from 'react';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IncidentTimeline } from '@/components/dashboard/incident-timeline';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function IncidentDetailPage({ params }: PageProps) {
  const session = await requireSession();
  const { orgId, role } = session.user;

  const incident = await prisma.incident.findFirst({
    where: {
      id: params.id,
      orgId,
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      services: {
        include: {
          service: true,
        },
      },
      updates: {
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!incident) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <IncidentTimeline incident={incident} role={role} />
    </div>
  );
}
