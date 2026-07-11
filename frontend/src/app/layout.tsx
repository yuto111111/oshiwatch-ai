import type { Metadata } from "next";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { ToastProvider } from "@/components/ui/Toast";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import JsonLd from "@/components/seo/JsonLd";
import {
  buildWebSiteJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo/json-ld";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";
import "./globals.css";

const SITE_NAME = "推し活AI";
const SITE_BASE = "https://devtest.oshikatsu-ai.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "推しの情報まとめと AI チャットで、推し活をもっと楽に。",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = getServerLocale();
  return (
    <html lang={initialLocale}>
      <body className="bg-surface min-h-screen flex flex-col">
        <JsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]} />

        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });`}
            </Script>
          </>
        )}

        <LocaleProvider initialLocale={initialLocale}>
          <ToastProvider>
            <Header />
            <PageViewTracker />
            <main className="flex-1 pb-14 md:pb-0">{children}</main>
            <Footer />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
