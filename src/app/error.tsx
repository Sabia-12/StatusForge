'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to server-side logs
    console.error('Global Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="h-14 w-14 rounded-full bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mb-6 border border-[var(--error)] shadow-sm">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
        A critical application error occurred. We have logged this error and are investigating.
      </p>
      <div className="flex gap-4">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
