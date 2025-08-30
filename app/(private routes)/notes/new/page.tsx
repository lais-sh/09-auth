"use client";

import NoteForm from "@/components/NoteForm/NoteForm";
import type { Metadata } from "next";
import css from "../page.module.css";

export const metadata: Metadata = {
  title: "Create note",
  description: "Create a new note",
};

export default function NewNotePage() {
  return (
    <main className={css.mainContent}>
      <NoteForm />
    </main>
  );
}
