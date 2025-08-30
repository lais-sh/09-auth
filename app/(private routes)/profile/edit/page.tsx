"use client";

import { Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
import css from "./page.module.css";

import { clientGetMe, clientUpdateMe } from "@/lib/api/clientApi";
import { useAuthStore } from "@/lib/store/authStore";

export default function ProfileEditPage() {
  const router = useRouter();

  const setUser = useAuthStore((s) => s.setUser);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("/avatar-placeholder.png");

  const [pending, setPending] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await clientGetMe();
        if (cancelled) return;

        setUsername(me.username);
        setEmail(me.email);
        setAvatar(me.avatar || "/avatar-placeholder.png");

        try {
          setUser(me);
        } catch {}
      } catch {
        if (!cancelled) setError("Failed to load profile");
      } finally {
        if (!cancelled) setPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUser]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await clientUpdateMe({ username });
      updateUser({
        username: updated.username,
        avatar: updated.avatar,
        email: updated.email,
      });
      router.replace("/profile");
    } catch {
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    router.back();
  }

  if (pending) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <main className={css.mainContent}>
        <div className={css.profileCard}>
          <h1 className={css.formTitle}>Edit Profile</h1>

          <Image
            src={avatar}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
          />

          <form className={css.profileInfo} onSubmit={onSubmit}>
            <div className={css.usernameWrapper}>
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                className={css.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <p>Email: {email}</p>

            <div className={css.actions}>
              <button type="submit" className={css.saveButton} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className={css.cancelButton}
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>

            {error && <p className={css.error}>{error}</p>}
          </form>
        </div>
      </main>
    </Suspense>
  );
}
