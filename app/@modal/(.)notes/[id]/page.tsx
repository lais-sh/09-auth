import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal/Modal";
import { serverFetchNoteById } from "@/lib/api/serverApi";
import type { Note } from "@/types/note";
import NotePreview from "./NotePreview.client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NoteModalPage({ params }: PageProps) {
  const { id } = await params;

  if (id === "new") return null;

  const qc = new QueryClient();

  const initial = await serverFetchNoteById(id).catch(() => null);
  if (initial) {
    qc.setQueryData<Note>(["note", id], initial);
  }

  return (
    <Modal>
      <HydrationBoundary state={dehydrate(qc)}>
        <NotePreview noteId={id} /> {/* ← теперь контент внутри модалки есть */}
      </HydrationBoundary>
    </Modal>
  );
}
