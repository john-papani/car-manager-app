import type { Metadata, Viewport } from "next";
import Script from "next/script";
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
  colorScheme: "light dark",
};

const themeScript = `
  try {
    const preference = localStorage.getItem("car-manager-theme") || "system";
    const theme = preference === "system"
      ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    document.documentElement.dataset.theme = theme;
  } catch {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" suppressHydrationWarning>
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
      <Script id="theme-init" strategy="beforeInteractive">
        {themeScript}
      </Script>
    </html>
  );
}
