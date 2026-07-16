import type { Metadata, Viewport } from "next";
import { Golos_Text, Literata } from "next/font/google";

import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/constants";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f6f2",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Дубно",
    "DubnoHub",
    "довідник Дубна",
    "кафе у Дубні",
    "аптеки Дубна",
    "ресторани Дубна",
  ],
  openGraph: {
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    type: "website",
    locale: "uk_UA",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_TAGLINE,
  },
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <div className="flex min-h-svh flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
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
