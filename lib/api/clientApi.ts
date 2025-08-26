import { api } from "./api";
import axios from "axios";
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
  perPage?: number;
  search?: string;
  tag?: NoteTag | "All" | string;
};

function toNumber(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeAxiosHeaders(
  headers: Record<string, unknown> | undefined
): Record<string, string | string[] | undefined> {
  if (!headers) return {};
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(headers)) {
    const key = k.toLowerCase();
    if (Array.isArray(v)) out[key] = v as string[];
    else if (typeof v === "string") out[key] = v;
    else if (v != null) out[key] = String(v);
    else out[key] = undefined;
  }
  return out;
}

function getFromHeaders(
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string
): string | undefined {
  if (!headers) return undefined;
  const v = headers[key.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

function pagesFromHeaders(
  headers: Record<string, string | string[] | undefined>,
  perPage: number
): number | undefined {
  const totalPagesH =
    getFromHeaders(headers, "x-total-pages") ??
    getFromHeaders(headers, "x-pagination-total-pages") ??
    getFromHeaders(headers, "x-pages");

  const totalCountH =
    getFromHeaders(headers, "x-total-count") ??
    getFromHeaders(headers, "x-total") ??
    getFromHeaders(headers, "x-pagination-total-count") ??
    getFromHeaders(headers, "x-count");

  const totalPages = toNumber(totalPagesH);
  if (totalPages) return Math.max(1, totalPages);

  const totalCount = toNumber(totalCountH);
  if (totalCount && perPage) return Math.max(1, Math.ceil(totalCount / perPage));

  return undefined;
}

function normalizeListResponse(
  raw: any,
  headers: Record<string, string | string[] | undefined> | undefined,
  page: number
): NotesResponse {
  const notes: Note[] =
    raw?.notes ?? raw?.results ?? raw?.items ?? raw?.data ?? (Array.isArray(raw) ? raw : []);

  const perPage =
    toNumber(raw?.perPage) ??
    toNumber(raw?.limit) ??
    toNumber(getFromHeaders(headers, "x-per-page")) ??
    PER_PAGE;

  let totalPages =
    toNumber(raw?.totalPages) ??
    (raw?.total
      ? Math.max(1, Math.ceil(Number(raw.total) / (perPage || PER_PAGE)))
      : undefined) ??
    (headers ? pagesFromHeaders(headers, perPage || PER_PAGE) : undefined);

  if (!totalPages) totalPages = 1;

  return { notes, totalPages, page };
}

export async function register(payload: {
  email: string;
  password: string;
}): Promise<User> {
  const { data } = await api.post<User>("/auth/register", payload);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<User> {
  const { data } = await api.post<User>("/auth/login", payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getSession(): Promise<User | null> {
  const { data } = await api.get<User | undefined>("/auth/session");
  return data ?? null;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function updateMe(payload: Partial<User>): Promise<User> {
  const { data } = await api.patch<User>("/users/me", payload);
  return data;
}

export async function getNotes(params: FetchNotesParams): Promise<NotesResponse> {
  const query: Record<string, string | number> = {
    page: params.page,
    perPage: params.perPage ?? PER_PAGE,
  };

  const s = params.search?.trim();
  if (s) query.search = s;
  if (params.tag && params.tag !== "All") query.tag = String(params.tag);

  try {
    const res = await api.get("/notes", { params: query });
    const headers = normalizeAxiosHeaders(res.headers as any);
    return normalizeListResponse(res.data, headers, params.page);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? "unknown";
      const body = err.response?.data ?? err.message;
      console.error("Failed to load notes (client)", {
        url: "/notes",
        params: query,
        status,
        body,
      });
      const msg =
        typeof body === "string"
          ? body
          : (body && (body.message || body.error)) || "Request failed";
      throw new Error(`List fetch failed (${status}). ${msg}`);
    }
    throw err;
  }
}

export async function getNoteById(noteId: string): Promise<Note> {
  const { data } = await api.get<Note | { note: Note }>(`/notes/${noteId}`);
  return (data as any)?.note ?? (data as Note);
}

export async function createNote(payload: NewNote): Promise<Note> {
  const { data } = await api.post<Note | { note: Note }>("/notes", payload);
  return (data as any)?.note ?? (data as Note);
}

export async function updateNote(
  noteId: string,
  payload: Partial<NewNote>
): Promise<Note> {
  const { data } = await api.patch<Note | { note: Note }>(`/notes/${noteId}`, payload);
  return (data as any)?.note ?? (data as Note);
}

export async function deleteNote(noteId: string): Promise<void> {
  await api.delete(`/notes/${noteId}`);
}

export {
  register as clientRegister,
  login as clientLogin,
  logout as clientLogout,
  getSession as clientSession,
  getMe as clientGetMe,
  updateMe as clientUpdateMe,
  getNotes as clientFetchNotes,
  getNoteById as clientFetchNoteById,
  createNote as clientCreateNote,
  updateNote as clientUpdateNote,
  deleteNote as clientDeleteNote,
  getNotes as fetchNotes,
};
