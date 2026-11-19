import type { MetadataRoute } from "next";

import { load } from "@/lib/safe";
import { canonicalFor, categoryPath, SITE_URL, tagPath } from "@/lib/site";
import { getAllPosts, getCategories, getTags } from "@/lib/vox";

export const revalidate = 3600;

/** Every article, topic and tag at this site's own addresses. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const res = await load(() => Promise.all([getAllPosts(), getCategories(), getTags()]));
  const home: MetadataRoute.Sitemap = [{ url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 }];
  if (!res.ok) return home;
  const [posts, categories, tags] = res.data;
  return [
    ...home,
    ...posts.map((p) => ({ url: canonicalFor(p), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${SITE_URL}${categoryPath(c.name)}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...tags.map((t) => ({ url: `${SITE_URL}${tagPath(t.name)}`, changeFrequency: "weekly" as const, priority: 0.3 })),
  ];
}
