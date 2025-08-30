"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientCreateNote as createNote } from "@/lib/api/clientApi";
import type { NewNote } from "@/types/note";
import css from "../page.module.css";

export default function NewNote() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<NewNote["tag"]>("Work");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const note = await createNote({ title, content, tag });
      router.replace("/notes");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to create note");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={css.form} onSubmit={onSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className={css.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          className={css.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          className={css.select}
          value={tag}
          onChange={(e) => setTag(e.target.value as NewNote["tag"])}
        >
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
          <option value="Todo">Todo</option>
        </select>
      </div>

      <div className={css.actions}>
        <button type="submit" className={css.submitButton} disabled={saving}>
          {saving ? "Saving..." : "Create"}
        </button>
      </div>

      {error && <p className={css.error}>{error}</p>}
    </form>
  );
}
