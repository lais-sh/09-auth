import type { Metadata } from "next";
import NoteForm from "@/components/NoteForm/NoteForm";
import css from "./new.module.css";

export const metadata: Metadata = {
  title: "Create note",
  description: "Create a new note",
};

export default function NewNotePage() {
  return (
    <main className={css.mainContent}>
      <h1 className={css.title}>Create note</h1>
      <NoteForm />
    </main>
  );
}
