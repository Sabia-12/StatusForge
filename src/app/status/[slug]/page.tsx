import * as React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { StatusHeader } from '@/components/status/status-header';
import { ServicePanel } from '@/components/status/service-panel';
import { IncidentHistory } from '@/components/status/incident-history';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: { name: true },
  });

  if (!org) {
    return {
      title: 'Organization Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    title: `${org.name} System Status`,
    description: `Real-time health status, outage logs, and incident tracking for ${org.name}.`,
    alternates: {
      canonical: `${siteUrl}/status/${params.slug}`,
    },
    openGraph: {
      title: `${org.name} System Status`,
      description: `Real-time health status, outage logs, and incident tracking for ${org.name}.`,
      url: `${siteUrl}/status/${params.slug}`,
      type: 'website',
    },
  };
}

export default async function PublicStatusPage({ params }: PageProps) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.slug },
  });

  if (!org) {
    notFound();
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [services, activeIncidents, pastIncidents] = await Promise.all([
    prisma.service.findMany({
      where: {
        orgId: org.id,
        deletedAt: null,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    }),
    prisma.incident.findMany({
      where: {
        orgId: org.id,
        status: {
          not: 'resolved',
        },
      },
      include: {
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
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.incident.findMany({
      where: {
        orgId: org.id,
        status: 'resolved',
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
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
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text-primary)] font-sans pb-20 transition-colors duration-200">
      {/* Top micro sticky bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 select-none">
            <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-pulse-ring" />
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Public Page</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="max-w-4xl mx-auto px-4 mt-10 flex flex-col gap-10 animate-fade-in">
        <StatusHeader orgName={org.name} services={services} />

        <ServicePanel services={services} />

        <IncidentHistory activeIncidents={activeIncidents} pastIncidents={pastIncidents} />
      </main>
    </div>
  );
}
