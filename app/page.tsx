import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { serverFetch } from "@/lib/api/serverApi";
import type { User } from "@/types/user";

export const metadata: Metadata = {
  title: "NoteHub — Home",
  description:
    "Lightweight, intuitive note manager with authentication, tags, and search.",
};

export default async function HomePage() {
  const user = await serverFetch<User | undefined>("/auth/session");

  return (
    <main className={styles.main}>
      <section className={styles.section}>
        <h1 className={styles.heading}>Welcome to NoteHub</h1>

        <p className={styles.text}>
          NoteHub is a lightweight and intuitive platform for managing your
          personal notes. Capture your thoughts anytime and keep them organized
          in one secure place.
        </p>

        <p className={styles.text}>
          Enjoy a distraction-free interface for writing, editing, and exploring
          your notes. With keyword search and tag filtering, NoteHub simplifies
          note management for daily productivity.
        </p>

        <div className={styles.actions}>
          {user ? (
            <>
              <Link
                href="/profile"
                prefetch={false}
                className={styles.ctaButton}
              >
                Go to Profile
              </Link>
              <Link
                href="/notes"
                prefetch={false}
                className={styles.secondaryButton}
              >
                Open Notes
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                prefetch={false}
                className={styles.ctaButton}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                prefetch={false}
                className={styles.secondaryButton}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
