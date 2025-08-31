"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { clientFetchNotes } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";

import SearchBox from "@/components/SearchBox/SearchBox";
import Pagination from "@/components/Pagination/Pagination";
import NoteList from "@/components/NoteList/NoteList";

const asRoute = (href: string) => href as unknown as Route;

export default function NotesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Параметры фильтра/поиска из URL
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const search = (sp.get("search") ?? "").trim();
  const tag = (sp.get("tag") ?? "All") as NoteTag | "All" | string;

  // Получаем заметки
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["notes", { page, search, tag }],
    queryFn: () => clientFetchNotes({ page, search, tag }),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  // Построение href c актуальными query-параметрами
  const buildHref = useCallback(
    (next: Partial<{ page: number; search: string; tag: string }>) => {
      const params = new URLSearchParams(sp);
      if (next.page !== undefined) params.set("page", String(next.page));

      if (next.search !== undefined) {
        const v = next.search.trim();
        v ? params.set("search", v) : params.delete("search");
        params.set("page", "1");
      }
      if (next.tag !== undefined) {
        const v = next.tag.trim();
        v && v !== "All" ? params.set("tag", v) : params.delete("tag");
        params.set("page", "1");
      }

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, sp]
  );

  // Обработчики
  const onSearch = useCallback(
    (val: string) => {
      router.replace(asRoute(buildHref({ search: val })));
    },
    [buildHref, router]
  );

  const onPageChange = useCallback(
    (nextPage: number) => {
      router.replace(asRoute(buildHref({ page: nextPage })));
    },
    [buildHref, router]
  );

  // Распаковка данных
  const notes = data?.notes ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = data?.page ?? page;

  // Состояния
  if (isPending) return <p style={{ padding: 16 }}>Loading notes…</p>;

  if (isError) {
    const msg = (error as Error)?.message ?? "unknown";
    return (
      <p style={{ padding: 16, color: "tomato" }}>
        Failed to load notes: {msg}
      </p>
    );
  }

  // Порожній список — дружелюбный empty state
  if (!notes.length) {
    return (
      <section style={{ display: "grid", gap: 16 }}>
        <SearchBox
          defaultValue={search}
          onSearch={onSearch}
          placeholder="Search notes…"
        />
        <div style={{ padding: 16, opacity: 0.9 }}>
          <p style={{ marginBottom: 8 }}>No notes yet.</p>
          <Link href="/notes/new" className="underline">
            Create your first note
          </Link>
        </div>
        {isFetching && (
          <span aria-live="polite" style={{ opacity: 0.6 }}>
            Updating…
          </span>
        )}
      </section>
    );
  }

  // Основной рендер
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <SearchBox
        defaultValue={search}
        onSearch={onSearch}
        placeholder="Search notes…"
      />

      <NoteList notes={notes} />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {isFetching && (
        <span aria-live="polite" style={{ opacity: 0.6 }}>
          Updating…
        </span>
      )}
    </section>
  );
}
