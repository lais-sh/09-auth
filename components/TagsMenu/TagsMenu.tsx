'use client';

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import styles from "./TagsMenu.module.css";

const TAGS = ["Work", "Personal", "Meeting", "Shopping", "Todo"] as const;
type Tag = (typeof TAGS)[number];

export default function TagsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<HTMLAnchorElement[]>([]);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentTag = searchParams.get("tag") || "";

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (open && (e.key === "ArrowDown" || e.key === "Down")) {
        e.preventDefault();
        itemsRef.current[0]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = () => setOpen((v) => !v);

  const buildHref = (tag?: Tag) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("page");
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    const qs = params.toString();
    const notesPath = "/notes";
    return qs ? `${notesPath}?${qs}` : notesPath;
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const focusables = itemsRef.current.filter(Boolean);
    const idx = focusables.findIndex((el) => el === document.activeElement);

    if (e.key === "ArrowDown" || e.key === "Down") {
      e.preventDefault();
      const next = focusables[(idx + 1) % focusables.length];
      next?.focus();
    } else if (e.key === "ArrowUp" || e.key === "Up") {
      e.preventDefault();
      const prev = focusables[(idx - 1 + focusables.length) % focusables.length];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      focusables[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      focusables[focusables.length - 1]?.focus();
    }
  };

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuButton}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="tags-menu"
      >
        Notes ▾
      </button>

      {open && (
        <ul
          id="tags-menu"
          className={styles.menuList}
          role="menu"
          aria-label="Filter notes by tag"
          onKeyDown={onMenuKeyDown}
        >
          <li className={styles.menuItem} role="none">
            <Link
              href={buildHref(undefined)}
              prefetch={false}
              className={`${styles.menuLink} ${!currentTag ? styles.active : ""}`}
              onClick={() => setOpen(false)}
              role="menuitem"
              ref={(el) => {
                if (el) itemsRef.current[0] = el;
              }}
            >
              All notes
            </Link>
          </li>

          {TAGS.map((tag, i) => {
            const index = i + 1;
            const isActive = currentTag === tag;
            return (
              <li className={styles.menuItem} role="none" key={tag}>
                <Link
                  href={buildHref(tag)}
                  prefetch={false}
                  className={`${styles.menuLink} ${isActive ? styles.active : ""}`}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  ref={(el) => {
                    if (el) itemsRef.current[index] = el;
                  }}
                >
                  {tag}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
