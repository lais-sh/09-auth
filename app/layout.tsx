import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";

import TanStackProvider from "@/components/TanStackProvider/TanStackProvider";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

function getSiteUrl(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  const vercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const candidate = env || vercel || "http://localhost:3000";
  try {
    const hasProtocol = /^https?:\/\//i.test(candidate);
    const url = new URL(hasProtocol ? candidate : `https://${candidate}`);
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}
const siteUrl = getSiteUrl();

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NoteHub - Manage Your Notes",
    template: "%s | NoteHub",
  },
  description: "Create, filter and manage notes with ease.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NoteHub - Manage Your Notes",
    description: "Create, filter and manage notes with ease.",
    url: "/",
    siteName: "NoteHub",
    type: "website",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "NoteHub preview",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={roboto.variable}>
        <TanStackProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>

          <main>{children}</main>
          <Footer />
        </TanStackProvider>
      </body>
    </html>
  );
}
