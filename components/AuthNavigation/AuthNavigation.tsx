'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import css from './AuthNavigation.module.css';
import { useAuthStore } from '@/lib/store/authStore';
import { clientLogout } from '@/lib/api/clientApi';

export default function AuthNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const selector = useMemo(
    () => (s: ReturnType<typeof useAuthStore.getState>) => ({
      isAuthenticated: s.isAuthenticated,
      user: s.user,
      clearIsAuthenticated: s.clearIsAuthenticated,
      isAuthChecked: (s as any).isAuthChecked ?? true,
    }),
    []
  );

  const { isAuthenticated, user, clearIsAuthenticated, isAuthChecked } =
    useAuthStore(selector);

  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await clientLogout();
    } catch {
      // ignore
    } finally {
      clearIsAuthenticated();
      router.replace(`/sign-in?from=${encodeURIComponent(pathname)}` as any);
      router.refresh();
    }
  }, [loggingOut, clearIsAuthenticated, router, pathname]);

  if (!hydrated || !isAuthChecked) return null;

  if (isAuthenticated) {
    return (
      <>
        <li className={css.navigationItem}>
          <Link href="/profile" prefetch={false} className={css.navigationLink}>
            Profile
          </Link>
        </li>
        <li className={css.navigationItem}>
          <p className={css.userEmail}>{user?.email}</p>
          <button
            type="button"
            className={css.logoutButton}
            onClick={onLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
          >
            {loggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </li>
      </>
    );
  }

  return (
    <>
      <li className={css.navigationItem}>
        <Link href="/sign-in" prefetch={false} className={css.navigationLink}>
          Login
        </Link>
      </li>
      <li className={css.navigationItem}>
        <Link href="/sign-up" prefetch={false} className={css.navigationLink}>
          Sign up
        </Link>
      </li>
    </>
  );
}
