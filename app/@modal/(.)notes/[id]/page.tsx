import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import Modal from "@/components/Modal/Modal";
import { serverFetch } from "@/lib/api/serverApi";
import type { Note } from "@/types/note";
import NoteDetailsClient from "./NoteDetails.client";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NoteModalPage({ params }: PageProps) {
  const { id } = await params; 

  const qc = new QueryClient();

  try {
    const note = await serverFetch<Note>(`/notes/${id}`);
    qc.setQueryData(["note", id], note);
  } catch {
  }

  return (
    <Modal>
      <HydrationBoundary state={dehydrate(qc)}>
        <NoteDetailsClient noteId={id} />
      </HydrationBoundary>
    </Modal>
  );
}
