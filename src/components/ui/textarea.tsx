'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { FieldError } from './field-error';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'flex min-h-[80px] w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-150 focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 resize-y',
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

Textarea.displayName = 'Textarea';
