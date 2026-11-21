import { notFound } from "next/navigation";
import { cache } from "react";

import { getPosts, getSite } from "./vox";

/**
 * Languages. A site has one or more (from VOX's /public/v1/site, ordered, the first is the primary).
 *
 * - One language: every URL is as it always was (/blog/<slug>); only <html lang> changes.
 * - Several: each language lives under /<lang>/… (/en/blog/<slug>), and the primary one is also, and canonically,
 *   at the unprefixed URLs (/blog/<slug>).
 *
 * When the API has no /site endpoint (older VOX) or it fails, the languages come from VOX_LANGUAGES
 * ("bn,en", first = primary), else the newest post's language, else "en".
 */

/** Native names for the language switcher. Any other code is shown as is. */
export const LANGUAGE_NAMES: Record<string, string> = {
  bn: "বাংলা",
  en: "English",
  hi: "हिन्दी",
  ur: "اردو",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  id: "Bahasa Indonesia",
};

const RTL = new Set(["ar", "ur", "fa", "he", "ps", "sd", "ug", "yi"]);

const norm = (code: string) => code.trim().toLowerCase();
const base = (code: string) => norm(code).split("-")[0];

export const languageName = (code: string) => LANGUAGE_NAMES[norm(code)] ?? LANGUAGE_NAMES[base(code)] ?? code;
export const dirFor = (code: string): "ltr" | "rtl" => (RTL.has(base(code)) ? "rtl" : "ltr");

export interface SiteLanguages {
  /** Ordered, primary first, lower case. */
  languages: string[];
  primary: string;
  /** More than one language: /<lang>/ routes, the switcher and hreflang are on. */
  multi: boolean;
}

/** The language of the newest post, for a single-language site that has not set VOX_LANGUAGES. */
async function newestPostLanguage(): Promise<string | null> {
  try {
    const res = await getPosts({ perPage: 1 });
    return res.data[0]?.language ? norm(res.data[0].language) : null;
  } catch {
    return null;
  }
}

/** The site's languages, from VOX or the fallbacks above. Cached per request; the API call is cached five minutes. */
export const getSiteLanguages = cache(async (): Promise<SiteLanguages> => {
  const site = await getSite();
  let languages = (site?.languages ?? []).map(norm);
  let primary = site?.primaryLanguage ? norm(site.primaryLanguage) : "";
  if (languages.length === 0) {
    languages = (process.env.VOX_LANGUAGES ?? "").split(",").map(norm).filter(Boolean);
    primary = "";
  }
  if (languages.length === 0) languages = [(await newestPostLanguage()) ?? "en"];
  languages = [...new Set(languages)];
  if (!languages.includes(primary)) primary = languages[0];
  languages = [primary, ...languages.filter((l) => l !== primary)];
  return { languages, primary, multi: languages.length > 1 };
});

/** One language of the site, as a page renders it. */
export interface Locale extends SiteLanguages {
  lang: string;
  dir: "ltr" | "rtl";
  /** "" for the primary language (and on single-language sites), "/en" for another. Prepend it to every path. */
  prefix: string;
  /** The `lang` to send to the API: only on multi-language sites, so single-language sites query exactly as before. */
  apiLang: string | undefined;
}

/** Where a language's pages live on this site: "" (primary, or a language the site does not have) or "/<lang>". */
export function prefixFor(lang: string | null | undefined, site: SiteLanguages): string {
  const l = lang ? norm(lang) : site.primary;
  return site.multi && l !== site.primary && site.languages.includes(l) ? `/${encodeURIComponent(l)}` : "";
}

export function localeOf(lang: string, site: SiteLanguages): Locale {
  return { ...site, lang, dir: dirFor(lang), prefix: prefixFor(lang, site), apiLang: site.multi ? lang : undefined };
}

/**
 * The locale for a route. `segment` is the /<lang>/ part of the URL, or null on the unprefixed routes (the primary
 * language). A segment that is not one of a multi-language site's languages is a 404, as is any /<lang>/ URL on a
 * single-language site, so those keep exactly the URLs they had. With `{ soft: true }` (layouts) it falls back to
 * the primary language instead, so the 404 page still renders inside the layout.
 */
export async function getLocale(segment: string | null, opts: { soft?: boolean } = {}): Promise<Locale> {
  const site = await getSiteLanguages();
  if (segment === null) return localeOf(site.primary, site);
  let lang: string;
  try {
    lang = norm(decodeURIComponent(segment));
  } catch {
    lang = "";
  }
  if (site.multi && site.languages.includes(lang)) return localeOf(lang, site);
  if (opts.soft) return localeOf(site.primary, site);
  notFound();
}
