import "server-only";
import axios from "axios";
import { cookies } from "next/headers";
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

const ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const BASE_URL = `${ORIGIN}/api`;

async function buildCookieHeader(): Promise<string> {
  const store = await cookies() as any;
  if (store && typeof store.getAll === "function") {
    return store.getAll().map((c: any) => `${c.name}=${c.value}`).join("; ");
  }
  const str = store?.toString?.();
  return typeof str === "string" ? str : "";
}

async function getServerClient() {
  const cookieHeader = await buildCookieHeader();
  return axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
      cookie: cookieHeader,
      Accept: "application/json",
    },
    timeout: 15000,
    validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
  });
}

export async function serverFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieHeader = await buildCookieHeader();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      cookie: cookieHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
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


export async function serverGetMe(): Promise<User | null> {
  const me = await serverFetch<User | undefined>("/users/me").catch(() => undefined);
  return me ?? null;
}

export async function serverUpdateMe(payload: Partial<User>): Promise<User> {
  const client = await getServerClient();
  const { data } = await client.patch<User>("/users/me", payload);
  return data;
}

export async function serverFetchNotes(params: FetchNotesParams): Promise<NotesResponse> {
  const client = await getServerClient();

  const query: Record<string, string | number> = {
    page: params.page,
    perPage: PER_PAGE,
  };

  const s = params.search?.trim();
  if (s) query.search = s;
  if (params.tag && params.tag !== "All") query.tag = params.tag;

  const { data } = await client.get("/notes", { params: query });
  return normalizeListResponse(data, params.page);
}

export async function serverFetchNoteById(noteId: string): Promise<Note | null> {
  const client = await getServerClient();
  try {
    const { data } = await client.get<Note | { note: Note }>(`/notes/${noteId}`);
    return (data as any)?.note ?? (data as Note);
  } catch {
    return null;
  }
}

export async function serverCreateNote(payload: NewNote): Promise<Note> {
  const client = await getServerClient();
  const { data } = await client.post<Note | { note: Note }>("/notes", payload);
  return (data as any)?.note ?? (data as Note);
}

export async function serverUpdateNote(
  noteId: string,
  payload: Partial<NewNote>
): Promise<Note> {
  const client = await getServerClient();
  const { data } = await client.patch<Note | { note: Note }>(`/notes/${noteId}`, payload);
  return (data as any)?.note ?? (data as Note);
}

export async function serverDeleteNote(noteId: string): Promise<void> {
  const client = await getServerClient();
  await client.delete(`/notes/${noteId}`);
}

export default serverFetch;
