import * as React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="h-14 w-14 rounded-full bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-[var(--text-secondary)] mb-6 shadow-sm">
        404
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-8 leading-relaxed">
        The page you are looking for does not exist or has been removed. Check the URL and try again.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
          Go back home
        </Link>
      </div>
    </div>
  );
}
