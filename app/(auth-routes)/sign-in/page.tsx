'use client';

import { useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { clientLogin } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './page.module.css';

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') ?? '/profile';

  const { setUser } = useAuthStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: clientLogin,
    onSuccess: (user) => {
      setUser(user);
      router.refresh();
      router.replace(from);
    },
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLocalError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!email || !password) {
      setLocalError('Please enter email and password');
      return;
    }

    try {
      await mutateAsync({ email, password });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed';
      setLocalError(message);
    }
  }

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={onSubmit} noValidate>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            required
            disabled={isPending}
            autoComplete="email"
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            required
            disabled={isPending}
            autoComplete="current-password"
          />
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? '...' : 'Log in'}
          </button>
        </div>

        {localError && (
          <p className={css.error} role="alert" aria-live="assertive">
            {localError}
          </p>
        )}
      </form>
    </main>
  );
}
