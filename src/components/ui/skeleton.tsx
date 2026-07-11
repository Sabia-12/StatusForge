import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'row' | 'avatar' | 'block';
  width?: string;
  height?: string;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'block', width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{ width, height, ...style }}
        className={cn(
          'rounded-[var(--radius-sm)] bg-[var(--surface-hover)] motion-safe:animate-shimmer bg-gradient-to-r from-[var(--surface-hover)] via-[var(--border)] to-[var(--surface-hover)] bg-[length:200%_100%]',
          {
            'h-4 w-full': variant === 'text',
            'h-32 w-full rounded-[var(--radius-lg)]': variant === 'card',
            'h-16 w-full': variant === 'row',
            'h-10 w-10 rounded-full': variant === 'avatar',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
