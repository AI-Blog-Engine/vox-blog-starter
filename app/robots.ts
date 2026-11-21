import type { MetadataRoute } from "next";

import { getSiteLanguages } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteLanguages();
  // Search results are not for search engines, in any language.
  const disallow = ["/search", ...(site.multi ? site.languages.map((l) => `/${l}/search`) : []), "/api/"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
