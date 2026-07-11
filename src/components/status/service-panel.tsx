import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusDot } from '@/components/ui/status-dot';
import type { ServiceStatus } from '@/lib/validators';

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

interface ServicePanelProps {
  services: Service[];
}

export function ServicePanel({ services }: ServicePanelProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-[var(--border)] pb-4 mb-4">
        <CardTitle className="text-base font-bold text-[var(--text-primary)]">Services Health</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {services.length === 0 ? (
          <div className="text-center py-6 text-sm text-[var(--text-secondary)] italic">
            No services registered under this organization.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {services.map((service) => (
              <div
                key={service.id}
                className="py-4 flex items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors duration-150 px-2 rounded-[var(--radius-md)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <StatusDot status={service.status as ServiceStatus} size="sm" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-xs text-[var(--text-secondary)] truncate max-w-md mt-0.5">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={service.status as ServiceStatus} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
