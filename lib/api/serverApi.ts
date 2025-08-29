// lib/api/serverApi.ts
import "server-only";
import { cookies } from "next/headers";
import type { AxiosResponse } from "axios";
import { api } from "./api"; // <-- именованный импорт
import type { User } from "@/types/user";
import type { Note, NoteTag, NewNote } from "@/types/note";

export const PER_PAGE = 12 as const;

export type NotesResponse = {
  notes: Note[];
  totalPages: number;
  page: number;
};

type FetchNotesParams = {
  page: number;
  search?: string;
  tag?: NoteTag | "All";
};

// cookies() в твоём окружении возвращает Promise, поэтому ждём его
const withCookie = async () => ({
  headers: { Cookie: (await cookies()).toString() },
});

export async function serverGetSession(): Promise<AxiosResponse<User | undefined>> {
  return api.get<User | undefined>("/auth/session", await withCookie());
}

// Возвращаем null, если токен невалиден / 4xx, чтобы страница не падала
export async function serverGetMe(): Promise<User | null> {
  const res = await api.get<User>("/users/me", {
    ...(await withCookie()),
    validateStatus: () => true,
  });
  if (res.status === 200 && res.data) return res.data;
  return null;
}

export async function serverUpdateMe(payload: Partial<User>): Promise<User> {
  const { data } = await api.patch<User>("/users/me", payload, await withCookie());
  return data;
}

/** Универсальный GET-хелпер — данные как есть */
export async function serverFetch<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const { data } = await api.get<T>(path, { ...(await withCookie()), params });
  return data;
}

function normalizeListResponse(raw: any, page: number): NotesResponse {
  if (Array.isArray(raw)) {
    const notes = raw as Note[];
    const totalPages = Math.max(1, notes.length === PER_PAGE ? page + 1 : page);
    return { notes, totalPages, page };
  }
  const notes: Note[] = raw?.notes ?? raw?.results ?? raw?.items ?? raw?.data ?? [];
  const perPage = Number(raw?.perPage ?? raw?.limit ?? PER_PAGE) || PER_PAGE;
  const totalPages =
    typeof raw?.totalPages === "number"
      ? raw.totalPages
      : raw?.total
      ? Math.max(1, Math.ceil(Number(raw.total) / perPage))
      : Math.max(1, notes.length === perPage ? page + 1 : page);
  return { notes, totalPages, page };
}

export async function serverFetchNotes(params: FetchNotesParams): Promise<NotesResponse> {
  const query: Record<string, string | number> = {
    page: params.page,
    perPage: PER_PAGE,
  };
  const s = params.search?.trim();
  if (s) query.search = s;
  if (params.tag && params.tag !== "All") query.tag = params.tag;

  const { data } = await api.get("/notes", { ...(await withCookie()), params: query });
  return normalizeListResponse(data, params.page);
}

export async function serverFetchNoteById(noteId: string): Promise<Note | null> {
  try {
    const { data } = await api.get<Note | { note: Note }>(`/notes/${noteId}`, await withCookie());
    return (data as any)?.note ?? (data as Note);
  } catch {
    return null;
  }
}

export async function serverCreateNote(payload: NewNote): Promise<Note> {
  const { data } = await api.post<Note | { note: Note }>("/notes", payload, await withCookie());
  return (data as any)?.note ?? (data as Note);
}

export async function serverUpdateNote(noteId: string, payload: Partial<NewNote>): Promise<Note> {
  const { data } = await api.patch<Note | { note: Note }>(
    `/notes/${noteId}`,
    payload,
    await withCookie(),
  );
  return (data as any)?.note ?? (data as Note);
}

export async function serverDeleteNote(noteId: string): Promise<void> {
  await api.delete(`/notes/${noteId}`, await withCookie());
}

export default serverFetch;
