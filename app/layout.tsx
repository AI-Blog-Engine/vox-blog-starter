import type { Metadata } from "next";
import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

/**
 * Bricolage Grotesque (headings, navigation) and Source Serif 4 (reading), loaded by the browser from Google Fonts so
 * the build never needs the network. To self-host or change them, edit this URL and --display / --reading in
 * globals.css.
 */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en" },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <a href="#content" className="skip">Skip to content</a>
        <header className="masthead">
          <div className="wrap masthead-row">
            <Link href="/" className="brand">{SITE_NAME}</Link>
            <nav aria-label="Main" className="mainnav">
              <Link href="/categories">Topics</Link>
              <Link href="/tags">Tags</Link>
            </nav>
            <SearchForm />
          </div>
        </header>
        <main id="content">{children}</main>
        <footer className="footer">
          <div className="wrap footer-row">
            <p>{SITE_DESCRIPTION}</p>
            <nav aria-label="Footer">
              <Link href="/categories">Topics</Link>
              <Link href="/tags">Tags</Link>
              <a href="/rss.xml">RSS feed</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
