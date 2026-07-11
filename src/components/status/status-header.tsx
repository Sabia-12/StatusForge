import * as React from 'react';
import { StatusDot } from '@/components/ui/status-dot';
import { getOverallStatus } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/validators';

interface Service {
  status: string;
}

interface StatusHeaderProps {
  orgName: string;
  services: Service[];
}

export function StatusHeader({ orgName, services }: StatusHeaderProps) {
  const worstStatus = getOverallStatus(services as { status: ServiceStatus }[]);
  
  const getBannerConfig = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return {
          bgClass: 'bg-[var(--success-light)] border-[var(--success)] text-[var(--success)]',
          label: 'All Systems Operational',
        };
      case 'degraded':
        return {
          bgClass: 'bg-[var(--warning-light)] border-[var(--warning)] text-[var(--warning)]',
          label: 'Systems Operating under Degraded Performance',
        };
      case 'partial_outage':
        return {
          bgClass: 'bg-[var(--error-light)] border-[var(--error)] text-[var(--error)]',
          label: 'Systems Experiencing Partial Outage',
        };
      case 'major_outage':
        return {
          bgClass: 'bg-[var(--error-light)] border-[var(--error)] text-[var(--error)]',
          label: 'Systems Experiencing Major Outage',
        };
      case 'maintenance':
        return {
          bgClass: 'bg-[var(--maintenance-light)] border-[var(--maintenance)] text-[var(--maintenance)]',
          label: 'Active Scheduled Maintenance Progressing',
        };
      default:
        return {
          bgClass: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]',
          label: 'System Status Unspecified',
        };
    }
  };

  const banner = getBannerConfig(worstStatus);

  return (
    <header className="space-y-6">
      {/* Title logo branding */}
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded bg-[var(--accent)] flex items-center justify-center text-white font-bold text-xs shrink-0">
          S
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {orgName} <span className="font-normal text-[var(--text-secondary)]">Status</span>
        </h1>
      </div>

      {/* Hero Banner Status */}
      <div className={`p-6 border rounded-[var(--radius-lg)] flex items-center gap-3.5 shadow-sm transition-colors duration-200 ${banner.bgClass}`}>
        <StatusDot status={worstStatus} size="lg" />
        <span className="text-base sm:text-lg font-bold leading-none">{banner.label}</span>
      </div>
    </header>
  );
}
