import Link from "next/link";
import TagsMenu from "@/components/TagsMenu/TagsMenu";
import AuthNavigation from "@/components/AuthNavigation/AuthNavigation";
import css from "./Header.module.css";

export default function Header() {
  return (
    <header className={css.header}>
      <nav className={css.nav} aria-label="Main navigation">
        <div className={css.left}>
          <Link href="/" prefetch={false} className={css.link}>
            Home
          </Link>
          <TagsMenu />
        </div>

          <ul className={css.navigationList}>
          <AuthNavigation />
        </ul>
      </nav>
    </header>
  );
}
