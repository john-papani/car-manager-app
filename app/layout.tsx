import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AuthBanner from "@/components/AuthBanner";

export const metadata: Metadata = {
  title: "Car Manager",
  description: "Personal car fuel and service tracker",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#12313b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body className="text-[var(--foreground)] antialiased">
        <Suspense fallback={null}>
          <AuthBanner />
        </Suspense>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
