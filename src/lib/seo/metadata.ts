import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
const siteName = "گالری طلا لوکس";
const siteDescription = "ویترین آنلاین طلا و جواهرات لوکس؛ نمایش مجموعه‌های خاص بدون خرید آنلاین.";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "fa_IR",
    url: siteUrl,
  },
  icons: { icon: "/favicon.ico" },
};

export default defaultMetadata;

