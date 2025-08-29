import css from "./page.module.css";
import { serverGetMe } from "@/lib/api/serverApi";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
  description: "User profile page",
};

export default async function ProfilePage() {
  const user = await serverGetMe();
  if (!user) redirect("/sign-in");

  const src = user.avatar || "/avatar-placeholder.png";
  const isExternal = /^https?:\/\//.test(src);

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <div className={css.header}>
          <h1 className={css.formTitle}>Profile Page</h1>
          <Link href="/profile/edit" prefetch={false} className={css.editProfileButton}>
            Edit Profile
          </Link>
        </div>

        <div className={css.avatarWrapper}>
          <Image
            src={src}
            alt="User Avatar"
            width={120}
            height={120}
            className={css.avatar}
            unoptimized={isExternal}
          />
        </div>

        <div className={css.profileInfo}>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
        </div>
      </div>
    </main>
  );
}
