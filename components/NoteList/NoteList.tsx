'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteNote } from '@/lib/api/clientApi';
import type { Note } from '@/types/note';
import type { NotesResponse } from '@/lib/api/clientApi';

import css from './NoteList.module.css';

type NoteListProps = {
  // очікуємо масив, але на всяк випадок підстрахуємося
  notes: Note[] | any;
};

export default function NoteList({ notes }: NoteListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // гарантований масив для рендера
  const list: Note[] = Array.isArray(notes)
    ? notes
    : notes?.notes ?? notes?.items ?? notes?.data ?? [];

  const { mutate } = useMutation({
    mutationKey: ['note', 'delete'],
    mutationFn: (noteId: string) => deleteNote(noteId),

    // оптимістичне оновлення
    onMutate: async (noteId: string) => {
      setDeletingId(noteId);

      // зупиняємо всі запити "notes"
      await queryClient.cancelQueries({ queryKey: ['notes'], exact: false });

      // зберігаємо попередні значення усіх відповідних кешів
      const previous = queryClient.getQueriesData<NotesResponse>({ queryKey: ['notes'] });

      // у кожному кеші акуратно оновлюємо поле notes (не ламаючи форму NotesResponse)
      previous.forEach(([key, old]) => {
        const oldNotes = Array.isArray(old?.notes) ? old!.notes : [];
        const nextNotes = oldNotes.filter((n) => String(n.id) !== String(noteId));

        const next: NotesResponse = {
          page: old?.page ?? 1,
          totalPages: old?.totalPages ?? 1,
          notes: nextNotes,
        };

        queryClient.setQueryData<NotesResponse>(key, next);
      });

      return { previous };
    },

    // якщо помилка — відкат
    onError: (_err, _noteId, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData<NotesResponse>(key, data);
      });
      console.error('❌ Failed to delete note');
    },

    onSuccess: (_data, noteId) => {
      // інвалідуємо деталі видаленої нотатки та списки
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      queryClient.invalidateQueries({ queryKey: ['notes'], exact: false });
      // синхронізуємо SSR/маршрути
      router.refresh();
    },

    onSettled: () => setDeletingId(null),
  });

  if (!Array.isArray(list) || list.length === 0) {
    return <p className={css.empty}>No notes found.</p>;
  }

  return (
    <ul className={css.list}>
      {list.map(({ id, title, content, tag }) => {
        const idStr = String(id);
        const isDeleting = deletingId === idStr;

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
              aria-disabled={isDeleting}
              onClick={() => mutate(idStr)}
              disabled={isDeleting}
              data-note-id={idStr}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
