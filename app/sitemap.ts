import type { MetadataRoute } from "next";

import { getSiteLanguages, localeOf } from "@/lib/i18n";
import { load } from "@/lib/safe";
import { canonicalFor, categoryPath, homePath, languageAlternates, SITE_URL, tagPath } from "@/lib/site";
import { getAllPosts, getCategories, getTags } from "@/lib/vox";

export const revalidate = 3600;

/**
 * Every article, topic and tag at this site's own addresses. On a multi-language site: each language's home page
 * and taxonomies, and every article with hreflang alternates for its translations (x-default = the primary language).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteLanguages();
  const locales = site.languages.map((l) => localeOf(l, site));
  const homeAlternates = site.multi
    ? { languages: { ...Object.fromEntries(locales.map((l) => [l.lang, `${SITE_URL}${homePath(l.prefix)}`])), "x-default": `${SITE_URL}/` } }
    : undefined;
  const homes: MetadataRoute.Sitemap = locales.map((l) => ({
    url: `${SITE_URL}${homePath(l.prefix)}`,
    changeFrequency: "daily",
    priority: 1,
    ...(homeAlternates ? { alternates: homeAlternates } : {}),
  }));
  // Single-language sites query exactly as before (apiLang is undefined).
  const res = await load(() =>
    Promise.all([getAllPosts(), Promise.all(locales.map(async (l) => ({ l, categories: await getCategories(l.apiLang), tags: await getTags(l.apiLang) })))]),
  );
  if (!res.ok) return homes;
  const [posts, taxonomies] = res.data;
  return [
    ...homes,
    ...posts.map((p) => {
      const languages = site.multi ? languageAlternates(p, site) : undefined;
      return {
        url: canonicalFor(p, site),
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        ...(languages ? { alternates: { languages } } : {}),
      };
    }),
    ...taxonomies.flatMap(({ l, categories }) =>
      categories.map((c) => ({ url: `${SITE_URL}${categoryPath(c.name, l.prefix)}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ),
    ...taxonomies.flatMap(({ l, tags }) => tags.map((t) => ({ url: `${SITE_URL}${tagPath(t.name, l.prefix)}`, changeFrequency: "weekly" as const, priority: 0.3 }))),
  ];
}
