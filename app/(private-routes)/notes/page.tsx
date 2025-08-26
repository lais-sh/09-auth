import { serverFetch } from "@/lib/api/serverApi";
import type { Note } from "@/types/note";

export default async function NotesPage({
  searchParams,
}: {
  searchParams?: { search?: string; page?: string; tag?: string };
}) {
  const search = searchParams?.search ?? "";
  const tag = searchParams?.tag ?? "";
  const page = Number(searchParams?.page ?? "1");

  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (tag) qs.set("tag", tag);
  qs.set("page", String(page));
  qs.set("perPage", "12");

  const initialData = await serverFetch<Note[]>(`/notes?${qs.toString()}`);
}
