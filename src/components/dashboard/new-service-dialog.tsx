'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createServiceAction } from '@/server/actions/services';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { SERVICE_STATUSES } from '@/lib/validators';
import { getStatusLabel } from '@/lib/utils';

interface NewServiceDialogProps {
  open: boolean;
  onClose: () => void;
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
      Create Service
    </Button>
  );
}

export function NewServiceDialog({ open, onClose, onSuccess }: NewServiceDialogProps) {
  const [state, formAction] = useFormState(createServiceAction, initialState);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.success && open) {
      toast({
        title: 'Service created',
        description: 'The new service has been successfully created.',
        variant: 'success',
      });
      onSuccess();
      onClose();
    } else if (state.errors?._form) {
      toast({
        title: 'Error creating service',
        description: state.errors._form[0],
        variant: 'error',
      });
    }
  }, [state, toast, open, onSuccess, onClose]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Create new service</DialogTitle>
        <DialogDescription>
          Add a new resource component or system microservice to monitor.
        </DialogDescription>
      </DialogHeader>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Service name"
          name="name"
          placeholder="API Gateway, Database cluster, Web portal"
          required
          error={state.errors?.name?.[0]}
        />

        <Textarea
          label="Description"
          name="description"
          placeholder="Sub-description detailing location/purpose of service."
          error={state.errors?.description?.[0]}
        />

        <Select
          label="Initial Status"
          name="status"
          defaultValue="operational"
          error={state.errors?.status?.[0]}
        >
          {SERVICE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </Select>

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
