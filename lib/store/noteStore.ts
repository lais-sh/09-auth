import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Draft {
  title: string;
  content: string;
  tag: string;
}

export const initialDraft: Draft = {
  title: "",
  content: "",
  tag: "Todo",
};

interface NoteStore {
  draft: Draft;
  setDraft: (data: Partial<Draft>) => void;
  clearDraft: () => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setDraft: (data) =>
        set((state) => ({ draft: { ...state.draft, ...data } })),
      clearDraft: () => set({ draft: initialDraft }),
    }),
    { name: "note-draft" }
  )
);
