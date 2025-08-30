import { Suspense } from "react";

export default function EditProfileLayout({
  children,
}: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}