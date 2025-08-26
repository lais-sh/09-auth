import type { FC } from "react";
import css from "./Footer.module.css";

type FooterProps = {
  year?: number;
  siteName?: string;
  developerName?: string;
  contactEmail?: string;
  className?: string;
};

const Footer: FC<FooterProps> = ({
  year = new Date().getFullYear(),
  siteName = "NoteHub",
  developerName = "Lais Shamukh",
  contactEmail = "lithshamok@gmail.com",
  className,
}) => {
  return (
    <footer
      className={`${css.footer}${className ? ` ${className}` : ""}`}
      aria-label="Site footer"
    >
      <div className={css.content}>
        <p>© {year} {siteName}. All rights reserved.</p>

        <div className={css.wrap}>
          <p>Developer: {developerName}</p>

          <p>
            Contact us:{" "}
            <a
              href={`mailto:${contactEmail}`}
              className={css.link}
              aria-label={`Email ${siteName}`}
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

