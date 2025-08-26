"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Modal from "@/components/Modal/Modal";
import { getNoteById } from "@/lib/api/clientApi";
import type { Note } from "@/types/note";
import css from "./NotePreview.module.css";
type NotePreviewProps = {
  noteId: string;
  onClose?: () => void;
};

export default function NotePreview({ noteId, onClose }: NotePreviewProps) {
  const router = useRouter();
  const close = onClose ?? (() => router.back());

  const { data, error, isError, isPending, isFetching } = useQuery<Note, Error>({
    queryKey: ["note", noteId],
    queryFn: () => getNoteById(noteId),
    enabled: Boolean(noteId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, err) => {
      const msg = (err as Error)?.message ?? "";
      if (/404/i.test(msg)) return false;
      return failureCount < 2;
    },
  });

  const loading = isPending || (isFetching && !data);

  return (
    <Modal onClose={close}>
      {loading && <div className={css.stateBox}>Loading…</div>}

      {isError && !loading && (
        <div className={css.stateBox}>
          <p className={css.errorText}>
            Could not load preview{error?.message ? `: ${error.message}` : "."}
          </p>
          <button className={css.button} onClick={close}>Close</button>
        </div>
      )}

      {data && !loading && !isError && (
        <article className={css.card}>
          <header className={css.header}>
            <h2 className={css.title}>{data.title}</h2>
            <span className={css.tag}>{data.tag}</span>
          </header>

          <p className={css.content}>{data.content}</p>

          <footer className={css.footer}>
            <button className={css.button} onClick={close}>Close</button>
          </footer>
        </article>
      )}
    </Modal>
  );
}
