import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_API_URL &&
  process.env.NEXT_PUBLIC_API_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Page Not Found - NoteHub",
  description: "This page does not exist in NoteHub.",
  metadataBase: new URL(siteUrl),
  robots: { index: false, follow: false },
  openGraph: {
    title: "Page Not Found - NoteHub",
    description: "Oops! The page you are looking for does not exist.",
    url: "/not-found",
    images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
    siteName: "NoteHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Not Found - NoteHub",
    description: "Oops! The page you are looking for does not exist.",
    images: ["https://ac.goit.global/fullstack/react/notehub-og-meta.jpg"],
  },
  alternates: {
    canonical: "/not-found",
  },
};

export default function NotFound() {
  return (
    <main style={{ padding: "40px 24px" }}>
      <h1>Page not found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
    </main>
  );
}
