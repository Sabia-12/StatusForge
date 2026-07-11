'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { postIncidentUpdateAction } from '@/server/actions/incidents';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import { canWrite, formatDateTime, getImpactLabel, getImpactColor, getIncidentStatusLabel } from '@/lib/utils';
import { INCIDENT_STATUSES, type IncidentStatus, type IncidentImpact } from '@/lib/validators';

interface Author {
  name: string;
}

interface IncidentUpdate {
  id: string;
  body: string;
  status: string;
  createdAt: Date;
  author: Author;
}

interface IncidentService {
  service: {
    id: string;
    name: string;
    deletedAt: Date | null;
  };
}

interface Incident {
  id: string;
  title: string;
  status: string;
  impact: string;
  createdAt: Date;
  resolvedAt: Date | null;
  author: {
    name: string;
  };
  services: IncidentService[];
  updates: IncidentUpdate[];
}

interface IncidentTimelineProps {
  incident: Incident;
  role: string;
}

const initialState = {
  success: false,
  errors: {} as Record<string, string[]>,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Post Update
    </Button>
  );
}

export function IncidentTimeline({ incident, role }: IncidentTimelineProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useFormState(postIncidentUpdateAction, initialState);

  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Timeline updated',
        description: 'Your update has been published to the incident timeline.',
        variant: 'success',
      });
      router.refresh();
      // Reset form via element trigger
      const formEl = document.getElementById('timeline-update-form') as HTMLFormElement;
      if (formEl) formEl.reset();
    } else if (state.errors?._form) {
      toast({
        title: 'Failed to post update',
        description: state.errors._form[0],
        variant: 'error',
      });
    }
  }, [state, toast, router]);

  const isEditable = canWrite(role);
  const isResolved = incident.status === 'resolved';

  return (
    <div className="space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/dashboard/incidents"
          className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1.5 focus-visible:outline-none"
        >
          &larr; Back to incidents list
        </Link>
      </div>

      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{incident.title}</h1>
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
          <p className="text-xs text-[var(--text-secondary)]">
            Declared by {incident.author.name} on {formatDateTime(incident.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-[var(--text-secondary)] select-none">Affected Services:</span>
          {incident.services.map((item) => (
            <span
              key={item.service.id}
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                item.service.deletedAt
                  ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400 line-through'
                  : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-secondary)]'
              }`}
            >
              {item.service.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Sequence */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Incident Timeline</h2>
          <Card>
            {incident.updates.length === 0 ? (
              <div className="text-center p-8 text-sm text-[var(--text-secondary)]">No updates posted yet.</div>
            ) : (
              <div className="relative pl-8 border-l border-[var(--border)] ml-4 space-y-8 py-4">
                {incident.updates.map((update, index) => {
                  const stepNumber = index + 1;
                  return (
                    <div key={update.id} className="relative">
                      {/* Chronological Step Marker Number */}
                      <span className="absolute -left-[45px] top-0 flex items-center justify-center h-8 w-8 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] shadow-sm">
                        {stepNumber}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar name={update.author.name} size="sm" />
                          <div>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{update.author.name}</span>
                            <span className="text-xs text-[var(--text-secondary)] ml-1.5 uppercase font-bold">posted update</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={update.status as IncidentStatus} type="incident" />
                          <span className="text-xs font-mono text-[var(--text-secondary)]">{formatDateTime(update.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap pl-10">
                        {update.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Update Form (Members only) */}
        {isEditable && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Post Timeline Update</h2>
            <Card>
              {isResolved ? (
                <div className="text-center p-4">
                  <div className="h-10 w-10 rounded-full bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center mx-auto mb-3">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Incident is Resolved</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    This incident has been resolved. Updates are locked unless status requires modifying.
                  </p>
                </div>
              ) : (
                <form id="timeline-update-form" action={formAction} className="flex flex-col gap-4">
                  <input type="hidden" name="incidentId" value={incident.id} />

                  <Select
                    label="Updated Status"
                    name="status"
                    defaultValue={incident.status}
                    error={state.errors?.status?.[0]}
                  >
                    {INCIDENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getIncidentStatusLabel(status)}
                      </option>
                    ))}
                  </Select>

                  <Textarea
                    label="Update message"
                    name="body"
                    placeholder="We have identified the root cause and are preparing a hotfix release..."
                    required
                    error={state.errors?.body?.[0]}
                    rows={4}
                  />

                  <SubmitButton />
                </form>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
