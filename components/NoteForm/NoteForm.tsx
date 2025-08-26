'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { createNote } from '@/lib/api/clientApi';
import type { NewNote } from '@/types/note';
import { useNoteStore } from '@/lib/store/noteStore';
import styles from './NoteForm.module.css';

interface Props {
  onClose?: () => void;
}

export default function NoteForm({ onClose }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const draft = useNoteStore((s) => s.draft);
  const setDraft = useNoteStore((s) => s.setDraft);
  const clearDraft = useNoteStore((s) => s.clearDraft);

  const [error, setError] = useState<string | null>(null);

  const goBack = useCallback(() => {
    if (onClose) onClose();
    else router.back();
  }, [onClose, router]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NewNote) => createNote(data),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: ['notes'] }),
        queryClient.invalidateQueries({ queryKey: ['notes', { page: 1 }] }),
      ]);
      clearDraft();
      router.refresh();
      goBack();
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create note. Please try again.';
      setError(msg);

      if (status === 401) {
        router.replace('/sign-in?from=/notes');
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as { name: keyof NewNote; value: string };
    setDraft({ [name]: value } as Partial<NewNote>);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Подстрахуемся на случай пустого драфта
    const payload: NewNote = {
      title: (draft?.title || '').trim(),
      content: (draft?.content || '').trim(),
      tag: (draft?.tag as NewNote['tag']) || 'Todo',
    };

    if (!payload.title) {
      setError('Title is required.');
      return;
    }
    if (!payload.content) {
      setError('Content is required.');
      return;
    }
    if (!payload.tag) {
      setError('Tag is required.');
      return;
    }

    mutate(payload);
  };

  const handleCancel = () => {
      goBack();
  };

  const titleVal = draft?.title ?? '';
  const contentVal = draft?.content ?? '';
  const tagVal = (draft?.tag as NewNote['tag']) ?? 'Todo';

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>Title</span>
        <input
          name="title"
          value={titleVal}
          onChange={handleChange}
          required
          disabled={isPending}
          className={styles.input}
          placeholder="Your note title"
          aria-invalid={!!error && !titleVal}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Content</span>
        <textarea
          name="content"
          value={contentVal}
          onChange={handleChange}
          required
          disabled={isPending}
          className={styles.textarea}
          placeholder="Write your note..."
          rows={6}
          aria-invalid={!!error && !contentVal}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Tag</span>
        <select
          name="tag"
          value={tagVal}
          onChange={handleChange}
          disabled={isPending}
          className={styles.select}
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={isPending} className={styles.primary}>
          {isPending ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className={styles.ghost}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
