import * as React from 'react';
import { cn } from '@/lib/utils';
import type { ServiceStatus } from '@/lib/validators';

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status, size = 'md', ...props }, ref) => {
    const isOperational = status === 'operational';

    return (
      <span
        ref={ref}
        className={cn(
          'relative flex shrink-0',
          {
            'h-2 w-2': size === 'sm',
            'h-3.5 w-3.5': size === 'md',
            'h-5 w-5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {!isOperational && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-pulse-ring',
              {
                'bg-[var(--status-degraded)]': status === 'degraded',
                'bg-[var(--status-partial-outage)]': status === 'partial_outage',
                'bg-[var(--status-major-outage)]': status === 'major_outage',
                'bg-[var(--status-maintenance)]': status === 'maintenance',
              }
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-full w-full border border-black/10 dark:border-white/10',
            {
              'bg-[var(--status-operational)]': status === 'operational',
              'bg-[var(--status-degraded)]': status === 'degraded',
              'bg-[var(--status-partial-outage)]': status === 'partial_outage',
              'bg-[var(--status-major-outage)]': status === 'major_outage',
              'bg-[var(--status-maintenance)]': status === 'maintenance',
            }
          )}
        />
      </span>
    );
  }
);

StatusDot.displayName = 'StatusDot';
