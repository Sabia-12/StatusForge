import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
}

export const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, error, children, ...props }, ref) => {
    const message = error || children;
    if (!message) return null;

    return (
      <p
        ref={ref}
        className={cn('text-xs text-[var(--error)] flex items-center gap-1.5 mt-1.5 font-medium animate-fade-in', className)}
        {...props}
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>{message}</span>
      </p>
    );
  }
);

FieldError.displayName = 'FieldError';
