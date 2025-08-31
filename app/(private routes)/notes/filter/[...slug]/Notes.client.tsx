"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { clientFetchNotes } from "@/lib/api/clientApi";
import type { NoteTag } from "@/types/note";

export default function NotesClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(sp.get("page") ?? "1") || 1;
  const tagFromUrl = sp.get("tag") ?? "All";
  const searchFromUrl = sp.get("search") ?? "";

  const [page, setPage] = useState(pageFromUrl);
  const [search, setSearch] = useState(searchFromUrl);

  const tag = useMemo<NoteTag | "All" | string>(() => tagFromUrl, [tagFromUrl]);

  const q = useQuery({
    queryKey: ["notes", { page, search, tag }],
    queryFn: async () => {
      const res = await clientFetchNotes({ page, search, tag });
      console.log("[notes] response:", res);
      return res;
    },
    retry: false,                 // <— выключаем ретраи
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev, // <— держим прежние данные при пагинации
  });

  if (q.isPending) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  if (q.isError) {
    return (
      <div style={{ padding: 24, color: "tomato" }}>
        Failed to load notes.
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {(q.error as Error).message}
        </pre>
      </div>
    );
  }

  if (!q.data || q.data.notes.length === 0) {
    return <div style={{ padding: 24 }}>No notes yet.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* здесь ваш SearchBox/список/пагинация */}
      <ul>
        {q.data.notes.map((n) => (
          <li key={n.id}>
            <b>{n.title}</b> — {n.tag}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span style={{ margin: "0 8px" }}>
          {page} / {q.data.totalPages}
        </span>
        <button
          disabled={page >= q.data.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
