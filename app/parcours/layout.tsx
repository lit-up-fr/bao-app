"use client";

import AuthGuard from "@/components/AuthGuard";

export default function ParcoursLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
