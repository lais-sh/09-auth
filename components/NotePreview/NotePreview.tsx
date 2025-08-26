'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Note } from '@/types/note';
import styles from './NotePreview.module.css';

type Props = {
  note?: Note | null; 
};

export default function NotePreview({ note }: Props) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    try {
      router.back();
      setTimeout(() => {
        if (typeof document !== 'undefined' && !document.referrer) {
          router.replace('/notes');
        }
      }, 0);
    } catch {
      router.replace('/notes');
    }
  }, [router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleClose]);

  const { formattedDate, dateTimeAttr } = useMemo(() => {
    const toDate = (value: unknown): Date | null => {
      if (!value) return null;
      if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
      const d = new Date(value as any);
      return isNaN(d.getTime()) ? null : d;
    };
    const d = toDate(note?.createdAt as any);
    return {
      formattedDate: d
        ? new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(d)
        : '—',
      dateTimeAttr: d ? d.toISOString() : undefined,
    };
  }, [note?.createdAt]);

  const onBackdropClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!note) {
    return (
      <section
        className={styles.wrapper}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-title"
        onClick={onBackdropClick}
      >
        <article className={styles.note}>
          <header className={styles.header}>
            <h2 id="note-title" className={styles.title}>
              Note not found
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className={styles.closeButton}
              aria-label="Close note preview"
            >
              ✖
            </button>
          </header>
          <p className={styles.content}>We couldn&apos;t load this note.</p>
        </article>
      </section>
    );
  }

  return (
    <section
      className={styles.wrapper}
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-title"
      aria-describedby="note-content"
      onClick={onBackdropClick}
    >
      <article className={styles.note} role="document">
        <header className={styles.header}>
          <h2 id="note-title" className={styles.title}>
            {note.title?.trim() || 'Untitled'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Close note preview"
          >
            ✖
          </button>
        </header>

        <div className={styles.meta}>
          {note.tag && <span className={styles.tag}>{note.tag}</span>}
          <time className={styles.date} dateTime={dateTimeAttr}>
            {formattedDate}
          </time>
        </div>

        <p id="note-content" className={styles.content}>
          {note.content}
        </p>
      </article>
    </section>
  );
}
