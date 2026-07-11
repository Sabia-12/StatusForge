'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { FieldError } from './field-error';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[var(--error)] focus-visible:border-[var(--error)] focus-visible:ring-[var(--error)]',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p className="text-xs text-[var(--text-secondary)]">{helperText}</p>
        )}
        <FieldError error={error} />
      </div>
    );
  }
);

Input.displayName = 'Input';
