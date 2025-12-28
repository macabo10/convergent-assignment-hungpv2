"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute =
        pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/register") ||
        pathname.startsWith("/auth/forget-password") ||
        pathname.startsWith("/auth/callback") ||
        pathname.startsWith("/auth/update-password");

    useEffect(() => {
        if (!loading && !user && !isPublicRoute) {
            console.log("User not authenticated, redirecting to login.");
            router.push("/auth/login");
        }

        if (!loading && user && isPublicRoute) {
            if (pathname !== "/auth/update-password") {
                router.push("/");
            }
        }
    }, [user, loading, router, isPublicRoute, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-gemini-blue" />
            </div>
        );
    }

    return (isPublicRoute || user) ? <>{children}</> : null;
}