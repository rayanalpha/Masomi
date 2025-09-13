import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SmoothScrollProvider } from "@/components/providers/SmoothScroll";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  display: "swap",
});

export { default as metadata } from "@/lib/seo/metadata";

import PageTransition from "@/components/providers/PageTransition";
import SearchOverlay from "@/components/shared/SearchOverlay";
import BottomNav from "@/components/shared/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} antialiased bg-background text-foreground`}>
        {/* Smooth scroll on client only */}
        <SmoothScrollProvider />
        <Navbar />
        <PageTransition>
          <main className="pb-20 md:pb-0">{children}</main>
        </PageTransition>
        <Footer />
        {/* Overlays & Mobile Nav */}
        <SearchOverlay />
        <BottomNav />
      </body>
    </html>
  );
}
