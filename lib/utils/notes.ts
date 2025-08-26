import type { NoteTag } from '@/types/note';

export function normalizeTag(tag?: string): NoteTag | 'All' | undefined {
  if (!tag) return 'All';
  const t = tag.trim();
  if (!t) return 'All';
  if (t.toLowerCase() === 'all') return 'All';
  return t as NoteTag;
}
