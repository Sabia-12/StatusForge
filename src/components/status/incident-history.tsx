'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, getImpactLabel, getImpactColor } from '@/lib/utils';
import type { IncidentStatus, IncidentImpact } from '@/lib/validators';

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
  updates: IncidentUpdate[];
}

interface IncidentHistoryProps {
  activeIncidents: Incident[];
  pastIncidents: Incident[];
}

export function IncidentHistory({ activeIncidents, pastIncidents }: IncidentHistoryProps) {
  const [expandedIncidents, setExpandedIncidents] = React.useState<Record<string, boolean>>({});

  const toggleIncidentExpand = (id: string) => {
    setExpandedIncidents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderIncidentTimeline = (incident: Incident) => (
    <div className="relative pl-6 border-l border-[var(--border)] ml-3 space-y-6 my-4 animate-fade-in">
      {incident.updates.map((update, index) => (
        <div key={update.id} className="relative">
          {/* Step Number Dot */}
          <span className="absolute -left-[33px] top-0.5 flex items-center justify-center h-5 w-5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[9px] font-bold text-[var(--text-secondary)] shadow-sm">
            {index + 1}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[var(--text-primary)]">{update.author.name}</span>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium uppercase">update</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={update.status as IncidentStatus} type="incident" className="h-5 px-1.5 text-[10px]" />
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">{formatDateTime(update.createdAt)}</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap pl-5">
            {update.body}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Active Incidents Block */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">Active Incidents</h2>
        {activeIncidents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-[var(--text-secondary)]">
              No active outages or incidents reported. All systems operating.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {activeIncidents.map((incident) => (
              <Card key={incident.id} className="border-[var(--error)] shadow-md">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{incident.title}</h3>
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
                      First reported on {formatDateTime(incident.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {incident.services.map((item) => (
                      <span
                        key={item.service.id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)]"
                      >
                        {item.service.name}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderIncidentTimeline(incident)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Incidents Block (Last 30 Days) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">Past Incidents (Last 30 Days)</h2>
        {pastIncidents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-[var(--text-secondary)]">
              No incidents reported in the last 30 days.
            </CardContent>
          </Card>
        ) : (
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
            {pastIncidents.map((incident) => {
              const isExpanded = !!expandedIncidents[incident.id];
              return (
                <div key={incident.id} className="p-5 flex flex-col gap-3 hover:bg-[var(--surface-hover)] transition-colors duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => toggleIncidentExpand(incident.id)}
                          className="font-bold text-sm sm:text-base text-[var(--text-primary)] hover:text-[var(--accent)] text-left focus-visible:outline-none"
                        >
                          {incident.title}
                        </button>
                        <StatusBadge status={incident.status as IncidentStatus} type="incident" />
                        <Badge
                          style={{
                            backgroundColor: `${getImpactColor(incident.impact as IncidentImpact)}15`,
                            color: getImpactColor(incident.impact as IncidentImpact),
                          }}
                        >
                          {getImpactLabel(incident.impact as IncidentImpact)}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Resolved on {incident.resolvedAt ? formatDateTime(incident.resolvedAt) : formatDateTime(incident.createdAt)}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleIncidentExpand(incident.id)}
                      className="shrink-0 self-start sm:self-auto h-8 py-1"
                    >
                      {isExpanded ? 'Hide timeline' : 'View updates timeline'}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 border-t border-[var(--border)] pt-4">
                      {renderIncidentTimeline(incident)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
