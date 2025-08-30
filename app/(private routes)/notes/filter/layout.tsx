import type { ReactNode } from "react";
import { Suspense } from "react";

type LayoutProps = {
  children: ReactNode;
  sidebar: ReactNode; 
};

export default function FilterLayout({ children, sidebar }: LayoutProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
      <aside>
        <Suspense fallback={null}>{sidebar}</Suspense>
      </aside>
      <main>
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}
