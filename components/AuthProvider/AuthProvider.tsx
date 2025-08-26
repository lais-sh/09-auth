'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { clientSession, logout } from '@/lib/api/clientApi';

const PRIVATE_PREFIXES = ['/profile', '/notes'];
const isPrivate = (pathname: string) => PRIVATE_PREFIXES.some(p => pathname.startsWith(p));
const isAuthRoute = (pathname: string) => pathname === '/sign-in' || pathname === '/sign-up';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setUser, clearIsAuthenticated } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      setChecking(true);
      try {
        const user = await clientSession();
        if (cancelled) return;

        if (user) {
          setUser(user);
          if (isAuthRoute(pathname)) {
            router.replace('/profile');
            return;
          }
        } else {
          clearIsAuthenticated();
          if (isPrivate(pathname)) {
            await logout().catch(() => {});
            if (!cancelled) router.replace('/sign-in');
            return;
          }
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    void check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, setUser, clearIsAuthenticated]);

  if (checking) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return <>{children}</>;
}
