'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Dashboard Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
      <div className="h-12 w-12 rounded-full bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mb-4 border border-[var(--error)]">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Failed to load dashboard data</h2>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
        There was a connection error or authorization issue loading this dashboard component.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" size="md" onClick={() => reset()}>
          Retry load
        </Button>
        <Link href="/dashboard">
          <Button variant="primary" size="md">
            Go to Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}
