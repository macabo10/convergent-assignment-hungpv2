"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthRoute =
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/auth/forgot-password" ||
    pathname.startsWith("/account-settings");

  return (
    <>
      {!isAuthRoute && <Sidebar />}
      <main className="flex-1 flex flex-col relative bg-white">
        {children}
      </main>
    </>
  );
}