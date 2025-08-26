'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import type { AxiosError } from 'axios';
import type { Note } from '@/types/note';
import { getNoteById } from '@/lib/api/clientApi';
import css from './NoteDetailsClient.module.css';

type Props = {
  noteId?: string;
};

export default function NoteDetailsClient({ noteId }: Props) {
  const params = useParams<{ id?: string | string[] }>();
  const routeId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = noteId ?? routeId ?? '';

  if (!id) return null;

  const { data, isLoading, isError, error } = useQuery<Note, AxiosError>({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) return <p className={css.loading}>Loading…</p>;
  if (isError || !data) {
    return (
      <p className={css.error}>
        Failed to load note{error?.message ? `: ${error.message}` : ''}
      </p>
    );
  }

  const formatDate = (v?: string) =>
    v
      ? new Date(v).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' })
      : '';

  return (
    <article className={css.note}>
      <header className={css.header}>
        <h1 className={css.title}>{data.title}</h1>
        <span className={css.tag}>{data.tag}</span>
      </header>

      <p className={css.content}>{data.content}</p>

      <footer className={css.meta}>
        Created: {formatDate(data.createdAt)}
        {data.updatedAt ? ` • Updated: ${formatDate(data.updatedAt)}` : null}
      </footer>
    </article>
  );
}
