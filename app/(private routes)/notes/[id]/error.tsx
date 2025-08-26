'use client';

import { useEffect } from 'react';
import Link from 'next/link';

type ErrorProps = {
  error: (Error & { digest?: string }) | { message?: string; digest?: string } | unknown;
  reset: () => void;
};

function getMessage(err: ErrorProps['error']) {
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    return err.message;
  }
  return 'Unknown error';
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[notes/[id]] error boundary:', error);
  }, [error]);

  const message = getMessage(error);
  const isDev = process.env.NODE_ENV !== 'production';
  const digest =
    error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string'
      ? error.digest
      : undefined;

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: 40,
        maxWidth: 640,
        marginInline: 'auto',
        padding: 16,
      }}
    >
      <h2 style={{ marginBottom: 12 }}>Something went wrong</h2>

      <p role="alert" aria-live="assertive" style={{ marginBottom: 16 }}>
        {message}
      </p>

      {isDev && digest ? (
        <p style={{ marginBottom: 16, fontSize: 12, opacity: 0.8 }}>
          <code>digest: {digest}</code>
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button type="button" onClick={reset}>
          Try again
        </button>

        <Link href="/notes" prefetch={false} style={{ lineHeight: '32px' }}>
          Back to notes
        </Link>
      </div>
    </div>
  );
}
