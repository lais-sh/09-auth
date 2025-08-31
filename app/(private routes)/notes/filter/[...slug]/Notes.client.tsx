"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { clientFetchNotes, PER_PAGE, type NotesResponse } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";
import SearchBox from "@/components/SearchBox/SearchBox";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NotesClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const pageFromUrl = Number(sp.get("page") ?? "1") || 1;
  const tagFromUrl = sp.get("tag") ?? "All";
  const searchFromUrl = sp.get("search") ?? "";

  const [page, setPage] = useState(pageFromUrl);
  const [search, setSearch] = useState(searchFromUrl);

  const debouncedSearch = useDebouncedValue(search, 400);
  const tag = useMemo<NoteTag | "All" | string>(() => tagFromUrl, [tagFromUrl]);

  useEffect(() => {
    const usp = new URLSearchParams(sp.toString());
    usp.set("page", String(page));
    if (debouncedSearch) usp.set("search", debouncedSearch);
    else usp.delete("search");
    if (tag && tag !== "All") usp.set("tag", String(tag));
    else usp.delete("tag");
    router.replace(`${pathname}?${usp.toString()}`, { scroll: false });
  }, [page, debouncedSearch, tag]);

  const q = useQuery<NotesResponse, Error>({
    queryKey: ["notes", { page, search: debouncedSearch, tag }],
    queryFn: async () =>
      clientFetchNotes({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch || undefined,
        tag: tag !== "All" ? tag : undefined,
      }),
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });

  if (q.isPending) return <div style={{ padding: 24 }}>Loading…</div>;
  if (q.isError)
    return (
      <div style={{ padding: 24, color: "tomato" }}>
        Failed to load notes.
        <pre style={{ whiteSpace: "pre-wrap" }}>{q.error.message}</pre>
      </div>
    );

  const notes = q.data?.notes ?? [];
  const totalPages = q.data?.totalPages ?? 1;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <SearchBox
          onSearch={(v: string) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search notes…"
        />
        <Link href="/notes/action/create" prefetch={false} style={{ marginLeft: "auto" }}>
          Create note
        </Link>
      </div>

      <NoteList notes={notes} />

      <div style={{ marginTop: 12 }}>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
