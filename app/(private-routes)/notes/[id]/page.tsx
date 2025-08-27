import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { serverFetch } from "@/lib/api/serverApi";
import type { Note } from "@/types/note";

export const dynamic = "force-dynamic";

type Params = { id: string };

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://your-vercel-domain.vercel.app";

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { id } = await params;

  const fallbackTitle = "Note not found - NoteHub";
  const fallbackDescription = "The requested note does not exist.";

  if (!id) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: `${siteUrl}/notes/`,
        images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
        siteName: "NoteHub",
        type: "article",
      },
    };
  }

  try {
    const note = await serverFetch<Note>(`/notes/${encodeURIComponent(id)}`);
    const title = `${note.title} - NoteHub`;
    const description =
      (note.content ?? "").trim().slice(0, 160) ||
      `Details for note "${note.title}"`;

    return {
      title,
      description,
      alternates: { canonical: `/notes/${id}` },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/notes/${encodeURIComponent(id)}`,
        images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
        siteName: "NoteHub",
        type: "article",
      },
    };
  } catch {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: `${siteUrl}/notes/${encodeURIComponent(id)}`,
        images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
        siteName: "NoteHub",
        type: "article",
      },
    };
  }
}

export default async function NoteDetailsPage(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  if (!id) notFound();

  let note: Note | null = null;
  try {
    note = await serverFetch<Note>(`/notes/${encodeURIComponent(id)}`);
  } catch {}

  if (!note) notFound();

  return (
    <article style={{ maxWidth: 720, margin: "2rem auto", lineHeight: 1.6 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0 }}>{note.title}</h1>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: 8,
            background: "#eef",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {note.tag}
        </span>
      </header>

      <p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{note.content}</p>

      <footer style={{ marginTop: 24, fontSize: 12, color: "#666" }}>
        Created: {note.createdAt}
        {note.updatedAt ? ` • Updated: ${note.updatedAt}` : null}
      </footer>
    </article>
  );
}
