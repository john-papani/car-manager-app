import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import AppBottomNav from "@/components/AppBottomNav";
import AppProviders from "@/components/AppProviders";
import AppShell from "@/components/AppShell";
import OfflineProvider from "@/components/OfflineProvider";

export const metadata: Metadata = {
  title: "Car Manager",
  description: "Personal car fuel and service tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Car Manager",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
        <AppProviders>
          <OfflineProvider>
            <AppShell
              bottomNav={
                <Suspense fallback={null}>
                  <AppBottomNav />
                </Suspense>
              }
            >
              {children}
            </AppShell>
          </OfflineProvider>
        </AppProviders>
      </body>
    </html>
  );
}
