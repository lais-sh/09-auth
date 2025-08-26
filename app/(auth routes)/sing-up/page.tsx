'use client';

import { FormEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { clientRegister } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from './page.module.css';

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const { mutateAsync, isPending, error, reset } = useMutation({
    mutationFn: clientRegister,
    onSuccess: (user) => {
      setUser(user);
      router.replace('/profile');
    },
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    reset();

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    if (!email || !password) return;
    await mutateAsync({ email, password });
  }

  const errorMessage = useMemo(() => {
    const err: any = error;
    return (
      err?.response?.data?.message ||
      err?.message ||
      'Registration failed. Please try again.'
    );
  }, [error]);

  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Sign up</h1>
      <form className={css.form} onSubmit={onSubmit} noValidate>
        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            required
            autoComplete="email"
            disabled={isPending}
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
            autoComplete="new-password"
            disabled={isPending}
          />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={isPending}>
            {isPending ? '...' : 'Register'}
          </button>
        </div>

        {!!error && <p className={css.error}>{errorMessage}</p>}
      </form>
    </main>
  );
}
