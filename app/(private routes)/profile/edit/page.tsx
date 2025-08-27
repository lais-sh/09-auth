'use client';

import css from './page.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { clientGetMe, clientUpdateMe } from '@/lib/api/clientApi';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState<string>('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    (async () => {
      const me = await clientGetMe();
      setUsername(me.username);
      setEmail(me.email);
      setAvatar(me.avatar ?? null);
      setPending(false);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await clientUpdateMe({ username });
    router.replace('/profile');
  }

  function onCancel() {
    router.back();
  }

  if (pending) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={avatar || '/avatar-placeholder.png'}
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
            <button type="submit" className={css.saveButton}>
              Save
            </button>
            <button type="button" className={css.cancelButton} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
