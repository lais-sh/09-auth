'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { getNotes, type NotesResponse } from '@/lib/api/clientApi';
import type { NoteTag } from '@/types/note';
import { normalizeTag } from '@/lib/utils/notes';

import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';

import css from './Notes.client.module.css';

interface NotesClientProps {
  initialData: NotesResponse;
  tag?: string;
}

export default function NotesClient({ initialData, tag }: NotesClientProps) {
  const [page, setPage] = useState<number>(initialData?.page ?? 1);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebounce(search, 500);

  const safeTag: NoteTag | 'All' | undefined = normalizeTag(tag);
  const effectiveTag: NoteTag | undefined =
    safeTag && safeTag !== 'All' ? safeTag : undefined;

  useEffect(() => {
    setPage(1);
  }, [effectiveTag]);

  const {
    data = initialData,
    isError,
    error,
    isFetching,
  } = useQuery<NotesResponse, AxiosError>({
    queryKey: ['notes', { page, search: debouncedSearch.trim(), tag: effectiveTag }],
    queryFn: () =>
      getNotes({
        page,
        perPage: 12,
        search: debouncedSearch.trim(),
        tag: effectiveTag,
      }),
    initialData,
    placeholderData: (prev) => prev,
  });

  const handleSearch = (query: string) => {
    setPage(1);
    setSearch(query);
  };

  if (isError) {
    console.error('Failed to load notes', {
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return <p style={{ color: 'red' }}>Could not fetch the list of notes. Please try again later.</p>;
  }

  const title = !safeTag || safeTag === 'All' ? 'All notes' : `${safeTag} notes`;

  return (
    <section className={css.app}>
      <div className={css.toolbar}>
        <h2 className={css.title}>{title}</h2>

        <div className={css.actions}>
          <SearchBox onSearch={handleSearch} />
          <Link href="/notes/action/create" className={css.button} data-testid="create-note-link" prefetch={false}>
            Create note +
          </Link>
        </div>
      </div>

      {isFetching && <p style={{ opacity: 0.6, marginBottom: 8 }}>Searching…</p>}

      {data.notes.length > 0 ? <NoteList notes={data.notes} /> : <p>No notes found.</p>}

      {Math.max(1, data.totalPages) > 1 && (
        <Pagination currentPage={page} totalPages={Math.max(1, data.totalPages)} onPageChange={(p) => setPage(p)} />
      )}
    </section>
  );
}
