"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isNoSidebarRoute =
    pathname.startsWith("/auth") ||
    pathname.startsWith("/account-settings");

  return (
    <>
      {!isNoSidebarRoute && <Sidebar />}
      <main className="flex-1 flex flex-col relative bg-white">
        {children}
      </main>
    </>
  );
}