import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import AppBottomNav from "@/components/AppBottomNav";

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
        {children}
        <Suspense fallback={null}>
          <AppBottomNav />
        </Suspense>
      </body>
    </html>
  );
}
