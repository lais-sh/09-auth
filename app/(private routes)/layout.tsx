import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | NoteHub",
  description: "User profile section",
};

export default function ProfileLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal?: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
