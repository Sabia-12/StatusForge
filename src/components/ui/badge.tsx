import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold select-none',
          {
            'bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]': variant === 'default',
            'bg-[var(--success-light)] text-[var(--success)]': variant === 'success',
            'bg-[var(--warning-light)] text-[var(--warning)]': variant === 'warning',
            'bg-[var(--error-light)] text-[var(--error)]': variant === 'error',
            'bg-[var(--maintenance-light)] text-[var(--maintenance)]': variant === 'info',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
