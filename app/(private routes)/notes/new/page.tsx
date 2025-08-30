import type { Metadata } from "next";
import styles from "./new.module.css";
import NewNote from "./NewNote.client";

export const metadata: Metadata = {
  title: "Create note",
  description: "Create a new note",
};

export default function NewNotePage() {
  return (
    <main className={styles.mainContent}>
      <h1 className={styles.formTitle}>Create note</h1>
      <NewNote />
    </main>
  );
}
