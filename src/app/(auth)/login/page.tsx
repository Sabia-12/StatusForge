'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setErrors({
        email: !email ? 'Email is required' : '',
        password: !password ? 'Password is required' : '',
      });
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        toast({
          title: 'Sign in failed',
          description: 'Invalid email or password.',
          variant: 'error',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Successfully signed in.',
          variant: 'success',
        });
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      toast({
        title: 'An error occurred',
        description: 'Please try again later.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Sign in to your account
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Manage your services and incidents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          error={errors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.password}
        />

        <Button type="submit" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-[var(--text-secondary)]">New to StatusForge? </span>
        <Link
          href="/signup"
          className="font-semibold text-[var(--accent)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
        >
          Create an organization
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="text-sm text-[var(--text-secondary)] text-center py-4">Loading login form...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
