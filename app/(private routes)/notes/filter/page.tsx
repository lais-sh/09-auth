
import type { Metadata } from "next";
import NotesClient from "../Notes.client";

export const metadata: Metadata = {
  title: "All notes | NoteHub",
  description: "Browse and search your notes",
};

export default function NotesFilterIndexPage() {
  return <NotesClient />;
}
