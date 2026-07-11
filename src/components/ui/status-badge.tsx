import * as React from 'react';
import { cn, getStatusLabel, getIncidentStatusLabel } from '@/lib/utils';
import type { ServiceStatus, IncidentStatus } from '@/lib/validators';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ServiceStatus | IncidentStatus;
  type?: 'service' | 'incident';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, status, type = 'service', ...props }, ref) => {
    const label = type === 'service' 
      ? getStatusLabel(status as ServiceStatus) 
      : getIncidentStatusLabel(status as IncidentStatus);

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border select-none',
          {
            // Service Statuses
            'bg-[var(--success-light)] border-[var(--success)] text-[var(--success)]': status === 'operational' || status === 'resolved',
            'bg-[var(--warning-light)] border-[var(--warning)] text-[var(--warning)]': status === 'degraded' || status === 'identified',
            'bg-[var(--error-light)] border-[var(--error)] text-[var(--error)]': status === 'partial_outage' || status === 'major_outage' || status === 'investigating',
            'bg-[var(--maintenance-light)] border-[var(--maintenance)] text-[var(--maintenance)]': status === 'maintenance' || status === 'monitoring',
          },
          className
        )}
        {...props}
      >
        <span 
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-[var(--success)]': status === 'operational' || status === 'resolved',
            'bg-[var(--warning)]': status === 'degraded' || status === 'identified',
            'bg-[var(--error)]': status === 'partial_outage' || status === 'major_outage' || status === 'investigating',
            'bg-[var(--maintenance)]': status === 'maintenance' || status === 'monitoring',
          })}
        />
        <span>{label}</span>
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
