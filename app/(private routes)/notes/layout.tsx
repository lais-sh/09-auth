import type { ReactNode } from "react";
import css from "./NotesLayout.module.css";

export default function NotesLayout({ children }: { children: ReactNode }) {
  return <main className={css.mainContent}>{children}</main>;
}
