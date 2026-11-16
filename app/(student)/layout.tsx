import type { ReactNode } from "react";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}
