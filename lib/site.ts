import { prefixFor, type SiteLanguages } from "./i18n";
import type { Post, Translation } from "./vox";

/** Site settings, all from environment variables (see .env.example). */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = process.env.SITE_NAME || "My Blog";
export const SITE_DESCRIPTION = process.env.SITE_DESCRIPTION || "Articles, guides and notes.";
export const POSTS_PER_PAGE = 10;

const useApiCanonical = process.env.VOX_USE_API_CANONICAL === "true";

/**
 * Where things live on this site. `prefix` is the language prefix from the page's Locale ("" for the primary
 * language and on single-language sites, "/en" for another), so the defaults give the URLs the blog always had.
 */
export const homePath = (prefix = "") => prefix || "/";
export const postPath = (slug: string, prefix = "") => `${prefix}/blog/${encodeURIComponent(slug)}`;
export const categoryPath = (name: string, prefix = "") => `${prefix}/category/${encodeURIComponent(name)}`;
export const tagPath = (name: string, prefix = "") => `${prefix}/tag/${encodeURIComponent(name)}`;

/** A post's path on this site, under its own language. */
export const postHref = (post: Pick<Post, "slug" | "language">, site: SiteLanguages) => postPath(post.slug, prefixFor(post.language, site));

/**
 * The canonical address of a post. By default this site's own /blog/<slug> (under /<lang>/ for a language other than
 * the primary); with VOX_USE_API_CANONICAL=true, the canonical stored in VOX (built from the website's domain and blog
 * path there).
 */
export function canonicalFor(post: Pick<Post, "slug" | "seo" | "language">, site: SiteLanguages): string {
  if (useApiCanonical && post.seo.canonicalUrl) return post.seo.canonicalUrl;
  return `${SITE_URL}${postHref(post, site)}`;
}

/** The address of one of a post's translations, by the same rule as canonicalFor. */
function translationUrl(t: Translation, site: SiteLanguages): string | null {
  if (useApiCanonical && t.url) return t.url;
  // Without VOX's URL, only languages this site serves have an address here.
  if (!site.languages.includes(t.language.toLowerCase())) return null;
  return `${SITE_URL}${postHref(t, site)}`;
}

/**
 * hreflang alternates for a post: itself and each translation, plus x-default for the primary language's version.
 * Undefined when the post has no translations (so single-language pages stay as they were).
 */
export function languageAlternates(post: Post, site: SiteLanguages): Record<string, string> | undefined {
  const out: Record<string, string> = { [(post.language || site.primary).toLowerCase()]: canonicalFor(post, site) };
  for (const t of post.translations ?? []) {
    const url = t.language ? translationUrl(t, site) : null;
    if (url) out[t.language.toLowerCase()] = url;
  }
  if (Object.keys(out).length < 2) return undefined;
  if (out[site.primary]) out["x-default"] = out[site.primary];
  return out;
}

/** Each of a post's translations this site can link to: language and path (or VOX's URL). */
export function translationLinks(post: Post, site: SiteLanguages): { lang: string; href: string }[] {
  return (post.translations ?? []).flatMap((t) => {
    const lang = t.language?.toLowerCase();
    if (!lang || lang === post.language?.toLowerCase()) return [];
    if (site.languages.includes(lang)) return [{ lang, href: postHref(t, site) }];
    return useApiCanonical && t.url ? [{ lang, href: t.url }] : [];
  });
}
