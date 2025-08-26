'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Note modal error]', error);
  }, [error]);

  const message =
    error?.message?.trim() ||
    'Something went wrong while loading the note. Please try again.';

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        padding: '1.5rem',
        borderRadius: 12,
        border: '1px solid #ffd5d5',
        background: '#fff6f6',
        color: '#7a0b0b',
        maxWidth: 520,
        margin: '40px auto',
        boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
      }}
    >
      <h1 style={{ margin: '0 0 0.5rem', fontSize: 22 }}>Unable to load note</h1>
      <p style={{ margin: 0 }}>{message}</p>

      {process.env.NODE_ENV !== 'production' && error?.digest ? (
        <p style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
          digest: <code>{error.digest}</code>
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #b90e0e',
            background: '#b90e0e',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #e4b1b1',
            background: '#fff',
            color: '#7a0b0b',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
