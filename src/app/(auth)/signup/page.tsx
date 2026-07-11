'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { signupAction } from '@/server/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const initialState = {
  success: false,
  errors: {} as Record<string, string[]>,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth loading={pending}>
      Sign up
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, initialState);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.success) {
      toast({
        title: 'Account created!',
        description: 'Please sign in with your credentials.',
        variant: 'success',
      });
      router.push('/login');
    } else if (state.errors?._form) {
      toast({
        title: 'Registration failed',
        description: state.errors._form[0],
        variant: 'error',
      });
    }
  }, [state, router, toast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Create an organization
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Set up your organization and status dashboard.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Your name"
          name="name"
          placeholder="Acme engineer"
          required
          error={state.errors?.name?.[0]}
        />
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          error={state.errors?.email?.[0]}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
          error={state.errors?.password?.[0]}
        />
        <Input
          label="Organization name"
          name="orgName"
          placeholder="Acme Corp"
          required
          error={state.errors?.orgName?.[0]}
        />

        <SubmitButton />
      </form>

      <div className="text-center text-sm">
        <span className="text-[var(--text-secondary)]">Already have an account? </span>
        <Link
          href="/login"
          className="font-semibold text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
