import { type ClassValue, clsx } from 'clsx';
import type { ServiceStatus, IncidentStatus, IncidentImpact } from './validators';

// ─── Class Name Utility ──────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Time Formatting ─────────────────────────────────────────────────────────

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateOnly(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Status Helpers ──────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ServiceStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  partial_outage: 'Partial Outage',
  major_outage: 'Major Outage',
  maintenance: 'Maintenance',
};

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};

const IMPACT_LABELS: Record<IncidentImpact, string> = {
  none: 'None',
  minor: 'Minor',
  major: 'Major',
  critical: 'Critical',
};

export function getStatusLabel(status: ServiceStatus): string {
  return STATUS_LABELS[status] || status;
}

export function getIncidentStatusLabel(status: IncidentStatus): string {
  return INCIDENT_STATUS_LABELS[status] || status;
}

export function getImpactLabel(impact: IncidentImpact): string {
  return IMPACT_LABELS[impact] || impact;
}

// Status severity for comparison (higher = worse)
const STATUS_SEVERITY: Record<ServiceStatus, number> = {
  operational: 0,
  maintenance: 1,
  degraded: 2,
  partial_outage: 3,
  major_outage: 4,
};

export function getOverallStatus(
  services: { status: ServiceStatus }[]
): ServiceStatus {
  if (services.length === 0) return 'operational';
  return services.reduce<ServiceStatus>((worst, service) => {
    return STATUS_SEVERITY[service.status] > STATUS_SEVERITY[worst]
      ? service.status
      : worst;
  }, 'operational');
}

export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'operational':
      return 'var(--status-operational)';
    case 'degraded':
      return 'var(--status-degraded)';
    case 'partial_outage':
      return 'var(--status-partial-outage)';
    case 'major_outage':
      return 'var(--status-major-outage)';
    case 'maintenance':
      return 'var(--status-maintenance)';
    default:
      return 'var(--text-secondary)';
  }
}

export function getIncidentStatusColor(status: IncidentStatus): string {
  switch (status) {
    case 'investigating':
      return 'var(--status-major-outage)';
    case 'identified':
      return 'var(--status-degraded)';
    case 'monitoring':
      return 'var(--status-maintenance)';
    case 'resolved':
      return 'var(--status-operational)';
    default:
      return 'var(--text-secondary)';
  }
}

export function getImpactColor(impact: IncidentImpact): string {
  switch (impact) {
    case 'none':
      return 'var(--text-secondary)';
    case 'minor':
      return 'var(--status-degraded)';
    case 'major':
      return 'var(--status-partial-outage)';
    case 'critical':
      return 'var(--status-major-outage)';
    default:
      return 'var(--text-secondary)';
  }
}

// ─── Slug Generation ─────────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// ─── Uptime Calculation ──────────────────────────────────────────────────────

export function calculateUptime(
  incidents: { createdAt: Date; resolvedAt: Date | null }[],
  days: number = 90
): number {
  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const totalMs = now.getTime() - start.getTime();

  let downtimeMs = 0;
  for (const incident of incidents) {
    const incidentStart = new Date(incident.createdAt);
    const incidentEnd = incident.resolvedAt
      ? new Date(incident.resolvedAt)
      : now;

    const effectiveStart = incidentStart < start ? start : incidentStart;
    const effectiveEnd = incidentEnd > now ? now : incidentEnd;

    if (effectiveStart < effectiveEnd) {
      downtimeMs += effectiveEnd.getTime() - effectiveStart.getTime();
    }
  }

  return Math.max(0, Math.min(100, ((totalMs - downtimeMs) / totalMs) * 100));
}

// ─── Permission Helpers ──────────────────────────────────────────────────────

export function canWrite(role: string): boolean {
  return ['owner', 'admin', 'member'].includes(role);
}

export function canAdmin(role: string): boolean {
  return ['owner', 'admin'].includes(role);
}

export function canOwner(role: string): boolean {
  return role === 'owner';
}
