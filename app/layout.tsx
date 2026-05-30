import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { defaultMetadata } from "@/lib/seo";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PullToRefresh } from "@/components/shared/pull-to-refresh";
import { PWARegister } from "@/components/providers/pwa-register";
import { AuthGate } from "@/components/providers/auth-gate";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#155EEF"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-inter min-h-screen antialiased`}>
        <AppProviders>
          <AuthGate>
            <PullToRefresh>
              <PWARegister />
              <Navbar />
              <main className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-28 pt-24 sm:px-6 lg:px-8">
                {children}
              </main>
              <Footer />
              <BottomNav />
            </PullToRefresh>
          </AuthGate>
        </AppProviders>
      </body>
    </html>
  );
}
