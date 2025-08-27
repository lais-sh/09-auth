'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./SidebarNotes.module.css";

interface SidebarNotesProps {
  categories: string[];
}

export default function SidebarNotes({ categories }: SidebarNotesProps) {
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const makeHref = (tag?: string) => {
    const params = new URLSearchParams();
    if (tag && tag.trim()) params.set("tag", tag.trim());
    params.set("page", "1");
    const qs = params.toString();
    return qs ? `/notes?${qs}` : "/notes";
  };

  return (
    <nav className={styles.sidebar}>
      <ul className={styles.list}>
        <MenuItem
          href={makeHref()}
          label="All notes"
          active={!activeTag}
        />

        {categories.map((category) => {
          const label = category.trim();
          const href = makeHref(label);
          const isActive =
            !!activeTag && activeTag.toLowerCase() === label.toLowerCase();

          return (
            <MenuItem
              key={label}
              href={href}
              label={label}
              active={isActive}
            />
          );
        })}
      </ul>
    </nav>
  );
}

interface MenuItemProps {
  href: string;
  label: string;
  active?: boolean;
}

function MenuItem({ href, label, active }: MenuItemProps) {
  return (
    <li className={`${styles.item} ${active ? styles.active : ""}`}>
      <Link href={href} prefetch={false} className={styles.link}>
        {label}
      </Link>
    </li>
  );
}
