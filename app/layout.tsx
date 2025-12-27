import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { ConversationProvider } from "@/context/ConversationContext";
import AuthWrapper from "@/components/AuthWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PVH Persona AI Trainer",
  description: "Created by Phan Viet Hung",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <AuthProvider>
          {/* <ConversationProvider> */}
          <AuthWrapper>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AuthWrapper>
          {/* </ConversationProvider> */}
        </AuthProvider>
      </body>
    </html>
  );
}