"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRoutesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, []);

  return <>{children}</>;
}
