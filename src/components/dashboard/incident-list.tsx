'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { NewIncidentDialog } from './new-incident-dialog';
import { canWrite, formatRelativeTime, getImpactLabel, getImpactColor } from '@/lib/utils';
import type { IncidentStatus, IncidentImpact } from '@/lib/validators';

interface IncidentService {
  service: {
    id: string;
    name: string;
  };
}

interface Incident {
  id: string;
  title: string;
  status: string;
  impact: string;
  createdAt: Date;
  resolvedAt: Date | null;
  services: IncidentService[];
}

interface Service {
  id: string;
  name: string;
}

interface IncidentListProps {
  initialIncidents: Incident[];
  services: Service[];
  role: string;
  totalPages: number;
  currentPage: number;
}

export function IncidentList({
  initialIncidents,
  services,
  role,
  totalPages,
  currentPage,
}: IncidentListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = React.useState(searchParams.get('status') || '');

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    if (statusFilter) {
      params.set('status', statusFilter);
    } else {
      params.delete('status');
    }
    params.set('page', '1'); // reset page on filter
    router.push(`${pathname}?${params.toString()}`);
  }, [searchTerm, statusFilter, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    router.push(pathname);
  };

  const isEditable = canWrite(role);

  return (
    <div className="space-y-6">
      {/* Search and filters bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search incidents by title..."
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
            aria-label="Filter incidents by status"
          >
            <option value="">All Statuses</option>
            <option value="investigating">Investigating</option>
            <option value="identified">Identified</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>

        {isEditable && (
          <Button variant="primary" size="md" onClick={() => setCreateDialogOpen(true)} className="shrink-0 w-full md:w-auto">
            Report Incident
          </Button>
        )}
      </div>

      {/* Incidents Table/List */}
      {initialIncidents.length === 0 ? (
        <EmptyState
          title={searchTerm || statusFilter ? 'No incidents match filters' : 'No incidents recorded'}
          description={
            searchTerm || statusFilter
              ? 'Try resetting the filters or modifying the search terms to locate logged logs.'
              : 'Keep status updates organized. Report service outages and scheduled updates.'
          }
          actionLabel={searchTerm || statusFilter ? 'Reset Filters' : isEditable ? 'Report incident' : undefined}
          onAction={searchTerm || statusFilter ? handleResetFilters : isEditable ? () => setCreateDialogOpen(true) : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
            {initialIncidents.map((incident) => (
              <div
                key={incident.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors duration-150"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/dashboard/incidents/${incident.id}`}
                      className="font-bold text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline truncate text-sm sm:text-base focus-visible:outline-none"
                    >
                      {incident.title}
                    </Link>
                    <StatusBadge status={incident.status as IncidentStatus} type="incident" />
                    <Badge
                      style={{
                        backgroundColor: `${getImpactColor(incident.impact as IncidentImpact)}15`,
                        color: getImpactColor(incident.impact as IncidentImpact),
                      }}
                    >
                      {getImpactLabel(incident.impact as IncidentImpact)} Impact
                    </Badge>
                  </div>

                  {/* Affected service chips */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-[var(--text-secondary)] select-none">Affected:</span>
                    {incident.services.map((item) => (
                      <span
                        key={item.service.id}
                        className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)]"
                      >
                        {item.service.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {formatRelativeTime(incident.createdAt)}
                  </span>
                  <Link href={`/dashboard/incidents/${incident.id}`}>
                    <Button variant="secondary" size="sm">
                      View timeline &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &larr; Previous
              </Button>
              <span className="text-xs text-[var(--text-secondary)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </Button>
            </div>
          )}
        </div>
      )}

      {/* reporting dialog forms */}
      <NewIncidentDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        services={services}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
