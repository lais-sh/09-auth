"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./sidebar.module.css";

const TAGS = ["All", "Work", "Personal", "Meeting", "Shopping", "Todo"] as const;
type Tag = (typeof TAGS)[number];

function cn(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SidebarDefault() {
  const searchParams = useSearchParams();
  const currentTag = (searchParams.get("tag") as Tag) ?? "All";

  const basePath = "/notes/filter";

  const makeHref = (tag: Tag): { pathname: string; query?: Record<string, string> } => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (tag === "All") {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }

    const query = Object.fromEntries(params.entries()) as Record<string, string>;
    return { pathname: basePath, query };
  };

  const activeClass = (styles as Record<string, string>).active;

  return (
    <nav className={styles.sidebar} aria-label="Filter notes by tag">
      <ul className={styles.list}>
        {TAGS.map((t) => {
          const isActive = (t === "All" && !searchParams.get("tag")) || currentTag === t;
          return (
            <li key={t} className={styles.item}>
              <Link
                href={makeHref(t)}
                prefetch={false}
                className={cn(styles.link, isActive && activeClass)}
                aria-current={isActive ? "page" : undefined}
              >
                {t}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
