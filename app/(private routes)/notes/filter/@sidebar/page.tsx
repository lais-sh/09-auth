import dynamic from "next/dynamic";
const TagsMenu = dynamic(() => import("@/components/TagsMenu/TagsMenu"), {
  ssr: false,
  loading: () => <div style={{ padding: 12 }}>Loading…</div>,
});

export default function Sidebar() {
  return (
    <aside aria-label="Tags menu">
      <TagsMenu />
    </aside>
  );
}
