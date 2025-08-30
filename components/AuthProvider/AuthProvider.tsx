'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { useAuthStore } from '@/lib/store/authStore';
import { clientSession } from '@/lib/api/clientApi';

const PRIVATE_PREFIXES = ['/profile', '/notes'] as const;
const isPrivate = (p: string) => PRIVATE_PREFIXES.some((s) => p.startsWith(s));
const isAuthRoute = (p: string) => p === '/sign-in' || p === '/sign-up';
const asRoute = (href: string) => href as unknown as Route;

const DEFAULT_AFTER_LOGIN: Route = '/notes';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const fromParam = sp.get('from') ?? '';

  const { setUser, clearAuth, markChecked, isAuthChecked } = useAuthStore();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const user = await clientSession();
        if (!mounted.current) return;

        if (user) {
          setUser(user);

          if (isAuthRoute(pathname)) {
            const dest =
              fromParam && fromParam.startsWith('/') ? fromParam : DEFAULT_AFTER_LOGIN;
            router.replace(asRoute(dest));
            return;
          }
        } else {
          clearAuth();

          if (isPrivate(pathname)) {
            const dest = `/sign-in?from=${encodeURIComponent(pathname)}`;
            router.replace(asRoute(dest));
            return;
          }
        }
      } finally {
        if (mounted.current) markChecked();
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [pathname, fromParam, router, setUser, clearAuth, markChecked]);

  if (!isAuthChecked) return null;

  return <>{children}</>;
}
