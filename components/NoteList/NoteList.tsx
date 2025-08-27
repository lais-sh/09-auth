'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNote } from '@/lib/api/clientApi';
import type { Note } from '@/types/note';
import css from './NoteList.module.css';
import { useRouter } from 'next/navigation'; // ← додай

interface NoteListProps {
  notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
  const router = useRouter(); // ← додай
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutate } = useMutation({
    mutationKey: ['note', 'delete'],
    mutationFn: (noteId: string) => deleteNote(noteId),

    onMutate: async (noteId: string) => {
      setDeletingId(noteId);

      await queryClient.cancelQueries({ queryKey: ['notes'], exact: false });

      const previous = queryClient.getQueriesData<Note[]>({ queryKey: ['notes'] });

      previous.forEach(([key, old]) => {
        const next = (old ?? []).filter((n) => String(n.id) !== String(noteId));
        queryClient.setQueryData<Note[]>(key, next);
      });

      return { previous };
    },

    onError: (err, _noteId, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData<Note[]>(key, data);
      });
      console.error('❌ Failed to delete note:', err);
    },

    onSuccess: (_data, noteId) => {
      // ці інвалідації не зашкодять...
      queryClient.invalidateQueries({ queryKey: ['notes'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      // ...але саме це гарантує актуальний SSR-список
      router.refresh(); // ← додай
    },

    onSettled: () => {
      setDeletingId(null);
    },
  });

  if (!notes || notes.length === 0) {
    return <p className={css.empty}>No notes found.</p>;
  }

  return (
    <ul className={css.list}>
      {notes.map(({ id, title, content, tag }) => {
        const idStr = String(id);
        const isThisDeleting = deletingId === idStr;

        return (
          <li key={idStr} className={css.listItem}>
            <Link
              href={`/notes/${idStr}`}
              className={css.link}
              aria-label={`Open note ${title}`}
              prefetch={false}
            >
              <h2 className={css.title}>{title}</h2>
              <p className={css.content}>{content}</p>
              <span className={css.tag}>{tag}</span>
            </Link>

            <button
              className={css.button}
              type="button"
              aria-label={`Delete note ${title}`}
              aria-disabled={isThisDeleting}
              onClick={() => mutate(idStr)}
              disabled={isThisDeleting}
              data-note-id={idStr}
            >
              {isThisDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
