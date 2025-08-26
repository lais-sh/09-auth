import { notFound } from "next/navigation";
import type { Metadata } from "next";

import NotesClient from "./Notes.client";
import { serverFetch } from "@/lib/api/serverApi";
import type { Note, NoteTag } from "@/types/note";

export const dynamic = "force-dynamic";

const ALLOWED_TAGS = ["All", "Work", "Personal", "Meeting", "Shopping", "Todo"] as const;
type AllowedTag = (typeof ALLOWED_TAGS)[number];

type Params = { slug?: string[] };
type SParams = { page?: string | string[]; search?: string | string[]; q?: string | string[] };

const SITE_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const rawTag = decodeURIComponent(params.slug?.[0] ?? "All");
  const tag = (ALLOWED_TAGS.includes(rawTag as AllowedTag) ? (rawTag as AllowedTag) : "All") as AllowedTag;

  const title = tag === "All" ? "All notes - NoteHub" : `Notes tagged: ${tag} - NoteHub`;
  const description =
    tag === "All" ? "Browse all your personal notes in NoteHub." : `Browse notes tagged with ${tag} in NoteHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}/notes/filter/${encodeURIComponent(rawTag)}`,
      images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
      siteName: "NoteHub",
      type: "website",
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SParams;
}) {
  const rawTag = decodeURIComponent(params.slug?.[0] ?? "All");
  const tag = rawTag as NoteTag | "All";

  if (!ALLOWED_TAGS.includes(tag as AllowedTag)) {
    notFound();
  }

  const pageParam = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const searchParam =
    (Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search) ??
    (Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q) ??
    "";

  const pageNum = Math.max(1, Number(pageParam ?? 1) || 1);
  const q = typeof searchParam === "string" ? searchParam.trim() : "";

  const qs = new URLSearchParams();
  qs.set("page", String(pageNum));
  if (q) qs.set("search", q);
  if (tag !== "All") qs.set("tag", tag as NoteTag);

  type MaybePaginated =
    | { notes: Note[]; totalPages?: number; page?: number }
    | Note[];

  let normalized: { notes: Note[]; totalPages: number; page: number };

  try {
    const data = await serverFetch<MaybePaginated>(`/notes?${qs.toString()}`);

    if (Array.isArray(data)) {
      normalized = { notes: data, totalPages: 1, page: pageNum };
    } else {
      const notes = Array.isArray((data as any)?.notes) ? (data as any).notes : [];
      const totalPages =
        typeof (data as any)?.totalPages === "number" ? (data as any).totalPages : 1;
      const page = typeof (data as any)?.page === "number" ? (data as any).page : pageNum;
      normalized = { notes, totalPages, page };
    }
  } catch {
    normalized = { notes: [], totalPages: 1, page: pageNum };
  }

  return <NotesClient initialData={normalized} tag={rawTag} />;
}
