"use client";

import { useEffect } from "react";
import css from "./NotesError.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
  }, [error]);

  return (
    <div className={css.errorWrapper} role="alert">
      <h2 className={css.title}>Something went wrong</h2>
      <p className={css.message}>{error.message || "Failed to load notes."}</p>
      <button className={css.retryButton} onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
