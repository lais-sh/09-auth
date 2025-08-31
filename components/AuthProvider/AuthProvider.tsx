"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { clientGetMe } from "@/lib/api/clientApi";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearAuth, markChecked } = useAuthStore((s) => ({
    setUser: s.setUser,
    clearAuth: s.clearAuth,
    markChecked: s.markChecked,
  }));

  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as { success?: boolean } | null;

        if (!cancelled && data?.success) {
          try {
            const me = await clientGetMe();
            if (!cancelled) setUser(me);
          } catch {
            if (!cancelled) clearAuth();
          }
        } else {
          if (!cancelled) clearAuth();
        }
      } finally {
        if (!cancelled) {
          markChecked();
          setBooting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser, clearAuth, markChecked]);

  if (booting) return null;

  return <>{children}</>;
}
