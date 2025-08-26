'use client';

import { useMemo, KeyboardEvent } from 'react';
import clsx from 'clsx';
import css from './Pagination.module.css';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  className?: string;
};

type Item = number | 'dots';

function range(start: number, end: number): number[] {
  const len = end - start + 1;
  return len > 0 ? Array.from({ length: len }, (_, i) => start + i) : [];
}

function createItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): Item[] {
  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );

  const leftSiblingStart = Math.max(
    Math.min(
      currentPage - siblingCount,
      totalPages - boundaryCount - siblingCount * 2 - 1
    ),
    boundaryCount + 2
  );

  const rightSiblingEnd = Math.min(
    Math.max(
      currentPage + siblingCount,
      boundaryCount + siblingCount * 2 + 2
    ),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1
  );

  const items: Item[] = [
    ...startPages,
    leftSiblingStart > boundaryCount + 2 ? 'dots' : (boundaryCount + 1),
    ...range(leftSiblingStart, rightSiblingEnd),
    rightSiblingEnd < (endPages[0] ?? totalPages) - 1 ? 'dots' : ((endPages[0] ?? totalPages) - 1),
    ...endPages,
  ];

  const seen = new Set<string>();
  return items.filter((it) => {
    const key = typeof it === 'number' ? `n${it}` : 'd';
    if (typeof it === 'number' && (it < 1 || it > totalPages)) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  className,
}: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;

  const safeGo = (p: number) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange(p);
  };

  const items = useMemo(
    () => createItems(currentPage, totalPages, siblingCount, boundaryCount),
    [currentPage, totalPages, siblingCount, boundaryCount]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      safeGo(currentPage - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      safeGo(currentPage + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      safeGo(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      safeGo(totalPages);
    }
  };

  return (
    <nav
      aria-label="Pagination"
      className={clsx(css.pagination, className)}
      role="navigation"
    >
      <div
        className={css.list}
        role="list"
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-roledescription="pagination"
      >
        <button
          type="button"
          className={clsx(css.button, css.first)}
          onClick={() => safeGo(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
        >
          «
        </button>

        <button
          type="button"
          className={clsx(css.button, css.prev)}
          onClick={() => safeGo(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {items.map((it, idx) =>
          it === 'dots' ? (
            <span key={`dots-${idx}`} className={css.dots} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              type="button"
              key={it}
              className={clsx(css.button, it === currentPage && css.active)}
              onClick={() => safeGo(it)}
              aria-current={it === currentPage ? 'page' : undefined}
              aria-label={`Page ${it}`}
            >
              {it}
            </button>
          )
        )}

        <button
          type="button"
          className={clsx(css.button, css.next)}
          onClick={() => safeGo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          ›
        </button>

        <button
          type="button"
          className={clsx(css.button, css.last)}
          onClick={() => safeGo(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
        >
          »
        </button>

        <span className={css.meta} aria-live="polite">
          {currentPage} / {totalPages}
        </span>
      </div>
    </nav>
  );
}
