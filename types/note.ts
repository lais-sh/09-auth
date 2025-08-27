export const NOTE_TAGS = ["Todo", "Work", "Personal", "Meeting", "Shopping"] as const;
export type NoteTag = (typeof NOTE_TAGS)[number] | (string & {});

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: NoteTag;
  createdAt: string;
  updatedAt: string;
}

export interface NewNote {
  title: string;
  content: string;
  tag: NoteTag;
}

export type UpdateNote = Partial<NewNote>;

export interface NotesQuery {
  search?: string;
  page?: number;
  perPage?: number;
  tag?: string;
}

export interface NotesResponse {
  notes: Note[];
  totalPages?: number;
  page: number;
}

export type NoteDetailsResponse = Note;

export interface User {
  email: string;
  username: string;
  avatar: string;
}
