"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getNoteById } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";
import styles from "./NoteDetails.module.css";

type Props = { noteId?: string | null };

export default function NoteDetailsClient({ noteId }: Props) {
  if (!noteId) return <p className={styles.placeholder}>Select a note to see details</p>;

  const { data: note, isPending, isError, error } = useQuery<Note, Error>({
    queryKey: ["note", noteId],
    queryFn: () => getNoteById(noteId!),
    enabled: !!noteId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  if (isPending) return <p className={styles.loading}>Loading...</p>;
  if (isError || !note) {
    return <p className={styles.error}>Failed to load note{error?.message ? `: ${error.message}` : ""}</p>;
  }

  const createdAt = note.createdAt ? new Date(note.createdAt).toLocaleString() : "";

  return (
    <article className={styles.wrapper}>
      <h1 className={styles.title}>{note.title}</h1>
      <p className={styles.content}>{note.content}</p>
      <p><strong>Tag:</strong> {note.tag}</p>
      {createdAt && (
        <p className={styles.meta}>
          <em>
            Created at: <time dateTime={new Date(note.createdAt!).toISOString()}>{createdAt}</time>
          </em>
        </p>
      )}
    </article>
  );
}
