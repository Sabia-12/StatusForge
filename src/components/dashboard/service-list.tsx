'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { updateServiceStatusAction, deleteServiceAction } from '@/server/actions/services';
import { Card, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusDot } from '@/components/ui/status-dot';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NewServiceDialog } from './new-service-dialog';
import { useToast } from '@/components/ui/toast';
import { canWrite, canAdmin } from '@/lib/utils';
import { SERVICE_STATUSES, type ServiceStatus } from '@/lib/validators';
import { getStatusLabel } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
  sortOrder: number;
}

interface ServiceListProps {
  initialServices: Service[];
  role: string;
}

export function ServiceList({ initialServices, role }: ServiceListProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [services, setServices] = React.useState<Service[]>(initialServices);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStatusChange = async (serviceId: string, status: ServiceStatus) => {
    setUpdatingId(serviceId);
    
    // Optimistic update
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status } : s))
    );

    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('status', status);

    try {
      const res = await updateServiceStatusAction(formData);
      if (res.success) {
        toast({
          title: 'Status updated',
          description: `Service status updated to ${getStatusLabel(status)}.`,
          variant: 'success',
        });
        router.refresh();
      } else {
        // Rollback on failure
        setServices(initialServices);
        toast({
          title: 'Failed to update status',
          description: res.errors?._form?.[0] || 'Something went wrong.',
          variant: 'error',
        });
      }
    } catch {
      setServices(initialServices);
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);

    const formData = new FormData();
    formData.append('serviceId', deleteId);

    try {
      const res = await deleteServiceAction(formData);
      if (res.success) {
        toast({
          title: 'Service deleted',
          description: 'The service has been successfully removed.',
          variant: 'success',
        });
        setServices((prev) => prev.filter((s) => s.id !== deleteId));
        setDeleteId(null);
        router.refresh();
      } else {
        toast({
          title: 'Failed to delete service',
          description: res.errors?._form?.[0] || 'Something went wrong.',
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const isEditable = canWrite(role);
  const isDeletable = canAdmin(role);

  return (
    <div className="space-y-6">
      {/* Search and action bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <SearchInput
          onChange={setSearchTerm}
          placeholder="Filter services by name or description..."
          className="max-w-md"
        />
        {isEditable && (
          <Button variant="primary" size="md" onClick={() => setCreateDialogOpen(true)} className="shrink-0">
            Create Service
          </Button>
        )}
      </div>

      {/* Grid List */}
      {filteredServices.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching services' : 'No services monitored'}
          description={
            searchTerm
              ? `We couldn't find any services matching "${searchTerm}". Try resetting your filter.`
              : 'Add services to start monitoring infrastructure statuses and reporting incidents.'
          }
          actionLabel={!searchTerm && isEditable ? 'Add your first service' : undefined}
          onAction={!searchTerm && isEditable ? () => setCreateDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="relative flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5">
                    <StatusDot status={service.status as ServiceStatus} />
                    <CardTitle className="text-base font-bold truncate max-w-[180px]">
                      {service.name}
                    </CardTitle>
                  </div>
                  <StatusBadge status={service.status as ServiceStatus} />
                </div>
                {service.description && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-6">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
                {isEditable ? (
                  <Select
                    defaultValue={service.status}
                    onChange={(e) => handleStatusChange(service.id, e.target.value as ServiceStatus)}
                    disabled={updatingId === service.id}
                    className="h-9 py-1 text-xs"
                    aria-label={`Update status of ${service.name}`}
                  >
                    {SERVICE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-xs font-semibold text-[var(--text-secondary)] select-none italic py-1">
                    Read-only viewer status indicators
                  </div>
                )}

                {isDeletable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-[var(--text-secondary)] hover:text-[var(--error)] focus-visible:ring-[var(--error)] shrink-0"
                    onClick={() => setDeleteId(service.id)}
                    aria-label={`Delete ${service.name}`}
                  >
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* dialog forms modals */}
      <NewServiceDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        description="Are you sure you want to delete this service? All historical dependencies of this service will be affected."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
