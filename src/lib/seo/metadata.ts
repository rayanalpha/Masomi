import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://masoomi-gallery.com";
const siteName = "گالری معصومی - طلا و جواهرات لوکس";
const siteDescription = "گالری معصومی با بیش از دو دهه تجربه در زمینه طلا و جواهرات، ارائه‌دهنده بهترین و باکیفیت‌ترین محصولات طلا و جواهرات در تهران. مجموعه‌ای منتخب از طلا و جواهرات لوکس.";

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

