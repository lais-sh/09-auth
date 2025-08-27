import type { Metadata } from "next";
import { serverFetch } from "@/lib/api/serverApi";
import type { Note } from "@/types/note";

type Params = { slug: string[] };
type SParams = Record<string, string | string[] | undefined>;

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params, searchParams }: { params: Promise<Params>; searchParams: Promise<SParams> }
): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;

  const titlePart =
    Array.isArray(slug) && slug.length ? slug.join(" / ") : "All";
  return {
    title: `Notes - ${titlePart}`,
    description: "Filtered notes list",
  };
}

export default async function NotesFilterPage(
  { params, searchParams }: { params: Promise<Params>; searchParams: Promise<SParams> }
) {
  const { slug } = await params;
  const sp = await searchParams;

  const getOne = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const search = getOne(sp.search);
  const tag = getOne(sp.tag);
  const page = Number(getOne(sp.page) ?? "1") || 1;

  if (Array.isArray(slug) && slug.length >= 2) {
    const [key, value] = slug;
    if (key === "tag") {
      const _ = tag;
    }
  }

  const paramsObj: Record<string, string | number | undefined> = {
    search: search || undefined,
    tag: tag || undefined,
    page,
  };
  const query = Object.entries(paramsObj)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

  const notes = await serverFetch<Note[]>(
    `/notes${query ? `?${query}` : ""}`
  );

  return (
    <main style={{ maxWidth: 960, margin: "2rem auto" }}>
      <h1>Filtered notes</h1>
      <ul>
        {notes.map((n) => (
          <li key={n.id}>
            <strong>{n.title}</strong> — {n.tag}
          </li>
        ))}
      </ul>
    </main>
  );
}
