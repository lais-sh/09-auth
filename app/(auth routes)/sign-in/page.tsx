"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import css from "./page.module.css";
import { login } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

const DEFAULT_AFTER_LOGIN: Route = "/profile";

function resolveRedirect(sp: ReturnType<typeof useSearchParams>): Route {
  const raw = sp.get("from");
  if (!raw) return DEFAULT_AFTER_LOGIN;

  try {
    const url = new URL(raw, "http://localhost");
    const p = url.pathname;

    if (p === "/profile" || p === "/notes" || p.startsWith("/notes/")) {
      return p as Route;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_AFTER_LOGIN;
}

export default function SignInPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const user = await login({ email, password });
      setUser(user);
      router.refresh();

      const to: Route = resolveRedirect(sp);
      router.replace(to);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <main className={css.mainContent}>
        <form className={css.form} onSubmit={onSubmit}>
          <h1 className={css.formTitle}>Sign in</h1>

          <div className={css.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" className={css.input} required />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" className={css.input} required />
          </div>

          <div className={css.actions}>
            <button type="submit" className={css.submitButton}>Log in</button>
          </div>

          {error && <p className={css.error}>{error}</p>}
        </form>
      </main>
    </Suspense>
  );
}
