import { serverFetch } from "@/lib/api/serverApi";
import type { Note } from "@/types/note";
import NoteList from "@/components/NoteList/NoteList"; // ← твій компонент

type NotesSearchParams = { search?: string; page?: string; tag?: string };

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: Promise<NotesSearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const search = sp.search ?? "";
  const tag = sp.tag ?? "";
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (tag) qs.set("tag", tag);
  qs.set("page", String(page));
  qs.set("perPage", "12");

  const notes = await serverFetch<Note[]>(`/notes?${qs.toString()}`);

  return (
    <main style={{ padding: 16 }}>
      <NoteList notes={notes} />
    </main>
  );
}
