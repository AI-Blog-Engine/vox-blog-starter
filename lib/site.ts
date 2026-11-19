import type { Post } from "./vox";

/** Site settings, all from environment variables (see .env.example). */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = process.env.SITE_NAME || "My Blog";
export const SITE_DESCRIPTION = process.env.SITE_DESCRIPTION || "Articles, guides and notes.";
export const POSTS_PER_PAGE = 10;

const useApiCanonical = process.env.VOX_USE_API_CANONICAL === "true";

/** Where a post lives on this site. */
export const postPath = (slug: string) => `/blog/${encodeURIComponent(slug)}`;
export const categoryPath = (name: string) => `/category/${encodeURIComponent(name)}`;
export const tagPath = (name: string) => `/tag/${encodeURIComponent(name)}`;

/**
 * The canonical address of a post. By default this site's own /blog/<slug>; with VOX_USE_API_CANONICAL=true, the
 * canonical stored in VOX (built from the website's domain and blog path there).
 */
export function canonicalFor(post: Pick<Post, "slug" | "seo">): string {
  if (useApiCanonical && post.seo.canonicalUrl) return post.seo.canonicalUrl;
  return `${SITE_URL}${postPath(post.slug)}`;
}
