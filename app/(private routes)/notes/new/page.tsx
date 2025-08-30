import type { Metadata } from "next";
import css from "../page.module.css";
import NewNote from "./NewNote.client";

export const metadata: Metadata = {
  title: "Create note",
  description: "Create a new note",
};

export default function NewNotePage() {
  return (
    <main className={css.mainContent}>
      <h1 className={css.formTitle}>Create note</h1>
      <NewNote />
    </main>
  );
}
