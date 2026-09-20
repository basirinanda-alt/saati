import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";
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
  metadataBase: new URL(SITE_URL),
  title: "Saati — Student Wellbeing Assessment",
  description:
    "A free, evidence-informed wellbeing check-in for students, built on the WHO-5 Wellbeing Index.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        {/* Google Ads conversion tracking — see docs/09-security.md and
            /privacy for third-party disclosure. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17047925915"
          strategy="afterInteractive"
        />
        {/* GA4 property for wellness.atlanticbuddhist.com. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-B9TTWNG3SS"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17047925915');
            gtag('config', 'G-B9TTWNG3SS');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
