"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">{children}</div>
    </div>
  );
}
