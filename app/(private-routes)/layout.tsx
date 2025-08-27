import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider/AuthProvider";

export const metadata: Metadata = {
  title: { default: "Private | NoteHub", template: "%s | NoteHub" },
  description: "User private section",
};

export default function PrivateRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

