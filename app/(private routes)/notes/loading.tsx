import css from "./NotesLoading.module.css";

export default function Loading() {
  return (
    <div className={css.loadingWrapper}>
      <div className={css.spinner} aria-label="Loading" />
      <p className={css.loadingText}>Loading notes…</p>
    </div>
  );
}
