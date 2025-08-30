"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import NoteList from "@/components/NoteList/NoteList";
import {
  clientFetchNotes,
  PER_PAGE,
  type NotesResponse,
} from "@/lib/api/clientApi";

const DEBOUNCE_MS = 400;

export default function NotesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const pageFromUrl = Number.parseInt(sp.get("page") ?? "1", 10) || 1;
  const searchFromUrl = sp.get("search") ?? "";
  const tagFromUrl = sp.get("tag") ?? "";

  const [search, setSearch] = useState(searchFromUrl);
  const [tag, setTag] = useState(tagFromUrl);
  const [page, setPage] = useState(pageFromUrl);

  // синк URL с debounce
  useEffect(() => {
    const h = setTimeout(() => {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("search", search.trim());
      if (tag.trim()) qs.set("tag", tag.trim());
      qs.set("page", String(page));

      const query = qs.toString();
      const href = (query ? `${pathname}?${query}` : pathname) as Route;
      router.replace(href);
    }, DEBOUNCE_MS);
    return () => clearTimeout(h);
  }, [search, tag, page, pathname, router]);

  // подхватываем изменения из адресной строки
  useEffect(() => {
    setSearch(searchFromUrl);
    setTag(tagFromUrl);
    setPage(pageFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFromUrl, tagFromUrl, pageFromUrl]);

  const queryKey = useMemo(
    () =>
      ["notes", { search: search.trim(), tag: tag.trim(), page, perPage: PER_PAGE }] as const,
    [search, tag, page]
  );

  const { data, isLoading, isError } = useQuery<NotesResponse, Error>({
    queryKey,
    queryFn: () =>
      clientFetchNotes({
        page,
        perPage: PER_PAGE,
        search: search.trim() || undefined,
        tag: tag.trim() || undefined,
      }),
    // v5: вместо keepPreviousData используем placeholderData (можно функцией)
    placeholderData: () => ({ notes: [], totalPages: 1, page }),
    // если хочешь держать старые данные пока грузятся новые:
    // staleTime: 0, gcTime: 5 * 60 * 1000, // опционально
  });

  // data может быть undefined (placeholderData не делает DefinedUseQueryResult)
  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? page;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          aria-label="Search notes"
        />
        <input
          type="text"
          placeholder="Tag (optional)"
          value={tag}
          onChange={(e) => {
            setPage(1);
            setTag(e.target.value);
          }}
          aria-label="Filter by tag"
        />
        <Link href="/notes/new" prefetch={false} style={{ marginLeft: "auto" }}>
          Create note
        </Link>
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p style={{ color: "crimson" }}>Failed to load notes</p>}
      {!isLoading && !isError && <NoteList notes={notes} />}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          ← Prev
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button type="button" disabled={!canNext} onClick={() => setPage((p) => p + 1)}>
          Next →
        </button>
      </div>
    </main>
  );
}
