import * as React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'StatusForge — Public Status Pages & Incident Timelines',
  description: 'Keep your customers informed during outages. Beautiful public status pages with chronological incident timelines and real-time state updates.',
};

export default function LandingPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://statusforge.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        'name': 'StatusForge',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'description': 'Beautiful public status pages with incident timelines for engineering teams.',
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/#faq`,
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is StatusForge?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'StatusForge is a SaaS application that lets you host beautiful public status pages, publish service health indicators, and track ongoing incident updates chronologically.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How does incident updates cascading work?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'When you declare an incident against specific services, StatusForge automatically updates the service status. When resolved, the status cascades back to operational.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-semibold text-lg tracking-tight">StatusForge</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] px-3 py-1.5 rounded"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] px-4 py-2 rounded-[var(--radius-md)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 sm:py-32 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-10">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-6">
              Host beautiful status pages for your{' '}
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                engineering teams
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 leading-relaxed">
              Keep customers aligned and trust high during outages. Publish service statuses, incident timelines, and keep timelines clean.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
              <Link
                href="/signup"
                className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] px-6 py-3.5 rounded-[var(--radius-lg)] font-medium text-base shadow-[var(--shadow-md)] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              >
                Create your status page
              </Link>
              <Link
                href="/status/acme"
                className="bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] px-6 py-3.5 rounded-[var(--radius-lg)] font-medium text-base transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              >
                View demo status page
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-[var(--border)] bg-[var(--surface)] transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to build trust</h2>
              <p className="text-base text-[var(--text-secondary)] max-w-xl mx-auto">
                StatusForge streamlines communications during service downtime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--bg)] transition-colors duration-200">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Service Health Indicators</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Track microservices, databases, APIs, and portals separately. Highlight degrades, outages, and scheduled maintenance.
                </p>
              </div>

              <div className="p-6 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--bg)] transition-colors duration-200">
                <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Chronological Timelines</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Post detailed updates as incidents progress. Log investigations, identifications, monitoring, and resolution.
                </p>
              </div>

              <div className="p-6 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--bg)] transition-colors duration-200">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Role-Based Controls</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Assign owners, admins, members, and viewers. Protect actions from unauthorized users securely.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} StatusForge. Digital Heroes Trial submission.
          </p>
          <div className="flex gap-4 text-xs text-[var(--text-secondary)]">
            <span>Built with Next.js 14 & Prisma</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
