import type { Metadata, Viewport } from "next";
import { Golos_Text, Literata } from "next/font/google";

import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  getSiteUrl,
  organizationJsonLd,
  SEO_KEYWORDS,
  websiteJsonLd,
} from "@/lib/seo";

import "./globals.css";

/** UI / body — Golos Text: кирилиця first-class, спокійний преміум-інтерфейс. */
const sans = Golos_Text({
  variable: "--font-sans",
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600"],
});

/** Display — Literata: editorial serif з кирилицею, гід міста / magazine feel. */
const display = Literata({
  variable: "--font-display",
  subsets: ["cyrillic", "cyrillic-ext", "latin", "latin-ext"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f6f2",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: APP_NAME, url: siteUrl }],
  creator: APP_NAME,
  publisher: APP_NAME,
  category: "travel",
  classification: "Міський довідник",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "uk-UA": "/",
    },
  },
  openGraph: {
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    type: "website",
    locale: "uk_UA",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
            ? {
                google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
              }
            : {}),
          ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ? {
                other: {
                  "msvalidate.01":
                    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
                },
              }
            : {}),
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} font-sans antialiased`}
      >
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <div className="flex min-h-svh flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster
              position="bottom-center"
              offset="max(1rem, env(safe-area-inset-bottom))"
              mobileOffset="max(1rem, env(safe-area-inset-bottom))"
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
