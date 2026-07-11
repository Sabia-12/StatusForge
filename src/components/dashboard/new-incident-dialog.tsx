'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createIncidentAction } from '@/server/actions/incidents';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { useToast } from '@/components/ui/toast';
import { INCIDENT_STATUSES, INCIDENT_IMPACTS } from '@/lib/validators';
import { getIncidentStatusLabel, getImpactLabel } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
}

interface NewIncidentDialogProps {
  open: boolean;
  onClose: () => void;
  services: Service[];
  onSuccess: () => void;
}

const initialState = {
  success: false,
  errors: {} as Record<string, string[]>,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      Report Incident
    </Button>
  );
}

export function NewIncidentDialog({ open, onClose, services, onSuccess }: NewIncidentDialogProps) {
  const [state, formAction] = useFormState(createIncidentAction, initialState);
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (state.success && open) {
      toast({
        title: 'Incident created',
        description: 'The incident has been logged and the statuses of affected services updated.',
        variant: 'success',
      });
      setSelectedServices([]);
      onSuccess();
      onClose();
    } else if (state.errors?._form) {
      toast({
        title: 'Failed to create incident',
        description: state.errors._form[0],
        variant: 'error',
      });
    }
  }, [state, toast, open, onSuccess, onClose]);

  const handleCheckboxChange = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Report new incident</DialogTitle>
        <DialogDescription>
          Declare an outage or degrade. Affected services will update status immediately.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Incident title"
          name="title"
          placeholder="API outage, latency spike, database maintenance"
          required
          error={state.errors?.title?.[0]}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Incident Severity / Impact"
            name="impact"
            defaultValue="minor"
            error={state.errors?.impact?.[0]}
          >
            {INCIDENT_IMPACTS.map((impact) => (
              <option key={impact} value={impact}>
                {getImpactLabel(impact)}
              </option>
            ))}
          </Select>

          <Select
            label="Current Status"
            name="status"
            defaultValue="investigating"
            error={state.errors?.status?.[0]}
          >
            {INCIDENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getIncidentStatusLabel(status)}
              </option>
            ))}
          </Select>
        </div>

        {/* Affected services checklist */}
        <div className="flex flex-col gap-1.5">
          <Label>Affected Services</Label>
          {services.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] italic">No operational services found to select.</p>
          ) : (
            <div className="border border-[var(--border)] rounded-[var(--radius-md)] p-3 max-h-40 overflow-y-auto flex flex-col gap-2">
              {services.map((service) => (
                <label key={service.id} className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="serviceIds"
                    value={service.id}
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleCheckboxChange(service.id)}
                    className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] h-4 w-4"
                  />
                  <span>{service.name}</span>
                </label>
              ))}
            </div>
          )}
          <FieldError error={state.errors?.serviceIds?.[0]} />
        </div>

        <Textarea
          label="Initial status update message"
          name="body"
          placeholder="We are investigating reports of database connections timed out..."
          required
          error={state.errors?.body?.[0]}
        />

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton />
        </DialogFooter>
      </form>
    </Dialog>
  );
}
