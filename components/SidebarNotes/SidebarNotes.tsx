'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './SidebarNotes.module.css';

interface SidebarNotesProps {
  categories: string[];
}

export default function SidebarNotes({ categories }: SidebarNotesProps) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');

  const makeHref = (tag?: string) => {
    const query: Record<string, string> = { page: '1' };
    const trimmed = tag?.trim();
    if (trimmed) query.tag = trimmed;
    return { pathname: '/notes/filter', query };
  };

  return (
    <nav className={styles.sidebar} aria-label="Filter notes by tag">
      <ul className={styles.list}>
        <MenuItem href={makeHref()} label="All notes" active={!activeTag} />
        {categories.map((category) => {
          const label = category.trim();
          const href = makeHref(label);
          const isActive =
            !!activeTag && activeTag.toLowerCase() === label.toLowerCase();

          return <MenuItem key={label} href={href} label={label} active={isActive} />;
        })}
      </ul>
    </nav>
  );
}

function MenuItem({
  href,
  label,
  active,
}: {
  href: { pathname: string; query?: Record<string, string> };
  label: string;
  active?: boolean;
}) {
  return (
    <li className={`${styles.item} ${active ? styles.active : ''}`}>
      <Link
        href={href}
        prefetch={false}
        className={styles.link}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </Link>
    </li>
  );
}
