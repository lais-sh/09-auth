// app/(private-routes)/notes/new/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { serverGetMe } from "@/lib/api/serverApi";
import NoteForm from "@/components/NoteForm/NoteForm";

export const metadata: Metadata = {
  title: "New note",
  description: "Create a new note",
};

export default async function NewNotePage() {
  const me = await serverGetMe();
  if (!me) {
    redirect("/sign-in?from=/notes/new");
  }

  return (
    <main style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: 16 }}>Create a note</h1>
      <NoteForm />
    </main>
  );
}
