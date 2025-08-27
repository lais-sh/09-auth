import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export default function FilterLayout({ children, sidebar }: LayoutProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}
