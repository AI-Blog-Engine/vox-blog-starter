import type { Metadata } from "next";
import Link from "next/link";

import { LanguageSwitcher, SwitcherProvider } from "@/components/language-switcher";
import { SearchForm } from "@/components/search-form";
import { dirFor, languageName, localeOf, type Locale } from "@/lib/i18n";
import { homePath, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Bricolage Grotesque (headings, navigation) and Source Serif 4 (reading), plus Noto Sans / Serif Bengali for Bangla
 * text, loaded by the browser from Google Fonts so the build never needs the network. Each font's CSS carries a
 * unicode-range, so the Bengali files are only downloaded on pages that contain Bengali text. To self-host or change
 * them, edit this URL and --display / --reading in globals.css.
 */
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400&family=Noto+Sans+Bengali:wght@400..800&family=Noto+Serif+Bengali:wght@400..700&display=swap";

/** The metadata every page starts from (each root layout exports it for its locale). */
export function shellMetadata(locale: Locale): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    openGraph: { siteName: SITE_NAME, type: "website", locale: locale.lang },
    alternates: { types: { "application/rss+xml": `${locale.prefix}/rss.xml` } },
  };
}

/** <html> with the page's language and direction, the masthead (with the language switcher on multi-language sites) and the footer. */
export function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const { prefix } = locale;
  const languages = locale.languages.map((lang) => ({ lang, name: languageName(lang), dir: dirFor(lang), href: homePath(localeOf(lang, locale).prefix) }));
  return (
    <html lang={locale.lang} dir={locale.dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <SwitcherProvider>
          <a href="#content" className="skip">Skip to content</a>
          <header className="masthead">
            <div className="wrap masthead-row">
              <Link href={homePath(prefix)} className="brand">{SITE_NAME}</Link>
              <nav aria-label="Main" className="mainnav">
                <Link href={`${prefix}/categories`}>Topics</Link>
                <Link href={`${prefix}/tags`}>Tags</Link>
              </nav>
              {locale.multi && <LanguageSwitcher current={locale.lang} languages={languages} />}
              <SearchForm prefix={prefix} />
            </div>
          </header>
          <main id="content">{children}</main>
          <footer className="footer">
            <div className="wrap footer-row">
              <p>{SITE_DESCRIPTION}</p>
              <nav aria-label="Footer">
                <Link href={`${prefix}/categories`}>Topics</Link>
                <Link href={`${prefix}/tags`}>Tags</Link>
                <a href={`${prefix}/rss.xml`}>RSS feed</a>
              </nav>
            </div>
          </footer>
        </SwitcherProvider>
      </body>
    </html>
  );
}
