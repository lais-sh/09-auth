import type { ReactNode } from "react";
import css from "./FilterLayout.module.css";

type FilterLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function FilterLayout({ children, sidebar }: FilterLayoutProps) {
  return (
    <div className={css.container}>
      <aside className={css.sidebar} aria-label="Filters">
        {sidebar ?? null}
      </aside>
      <section className={css.content} role="region">
        {children}
      </section>
    </div>
  );
}
