import * as React from 'react';
import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { getOverallStatus, formatDateTime, calculateUptime } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const session = await requireSession();
  const { orgId } = session.user;

  const [services, activeIncidents, incidentsCount, logs] = await Promise.all([
    prisma.service.findMany({
      where: { orgId, deletedAt: null },
    }),
    prisma.incident.findMany({
      where: { orgId, status: { not: 'resolved' } },
      include: { services: { include: { service: true } } },
    }),
    prisma.incident.findMany({
      where: { orgId },
      select: { createdAt: true, resolvedAt: true },
    }),
    prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
  ]);

  const totalServices = services.length;
  const operationalServices = services.filter((s) => s.status === 'operational').length;
  const operationalRate = totalServices > 0 ? Math.round((operationalServices / totalServices) * 100) : 100;
  
  const worstStatus = getOverallStatus(services as { status: ServiceStatus }[]);
  const uptime = calculateUptime(incidentsCount, 90);

  return (
    <div className="space-y-8">
      {/* Overall status banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          <StatusDot status={worstStatus} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {worstStatus === 'operational' ? 'All Systems Operational' : 'Active System Outages Detected'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Overall status based on {totalServices} service{totalServices === 1 ? '' : 's'}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/services">
            <span className="text-sm font-medium text-[var(--accent)] hover:underline">Manage Services &rarr;</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Total Services</CardTitle>
            <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{operationalServices} fully operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Active Incidents</CardTitle>
            <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents.length}</div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Operational Rate</CardTitle>
            <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operationalRate}%</div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Current system state health</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b-0 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Est. 90-Day Uptime</CardTitle>
            <svg className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uptime.toFixed(3)}%</div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Calculated from incident history</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent activity timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent Admin Activity</h3>
          <Card padding="none">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)]">No admin activity logged yet.</div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors duration-150">
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                        {log.user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {log.user.name} <span className="font-normal text-[var(--text-secondary)]">{log.action.replace('_', ' ')}d</span> {log.entityType}
                        </p>
                        {log.metadata && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono bg-[var(--surface-hover)] px-2 py-0.5 rounded border border-[var(--border)] inline-block">
                            {JSON.parse(log.metadata).name || JSON.parse(log.metadata).title || log.entityId}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Quick Actions</h3>
          <Card className="flex flex-col gap-3">
            <Link href="/dashboard/services" className="w-full">
              <Button variant="primary" size="md" fullWidth>
                Add New Service
              </Button>
            </Link>
            <Link href="/dashboard/incidents" className="w-full">
              <Button variant="secondary" size="md" fullWidth>
                Report System Incident
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
