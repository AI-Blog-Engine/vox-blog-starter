/**
 * A small client for the VOX Blog API (https://vox.bd/docs). Server-only: the key never reaches the browser.
 * Every request is cached for five minutes and tagged "vox", so the webhook at /api/revalidate can refresh them all
 * the moment a post is published, edited or unpublished.
 */

export interface Author {
  name: string;
  url: string | null;
  bio: string | null;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  keyword: string | null;
  tags: string[];
  categories: string[];
  language: string;
  publishedAt: string | null;
  updatedAt: string;
  wordCount: number | null;
  coverImageUrl: string | null;
  url: string | null;
  author: Author | null;
  /** The same article in the site's other languages. Absent or empty on single-language sites and older APIs. */
  translations?: Translation[];
  seo: { metaTitle: string; metaDescription: string; canonicalUrl: string | null; jsonLd: Record<string, unknown>[] };
  /** Only on a single post, or a list with include=content. Starts at the first <h2>: render the title yourself. */
  html?: string;
  markdown?: string;
}

export interface Translation {
  /** BCP-47, e.g. "en". */
  language: string;
  slug: string;
  /** The translation's live URL in VOX (used with VOX_USE_API_CANONICAL=true). */
  url: string | null;
}

/** GET /public/v1/site: the website's languages, in order; the first is the primary. */
export interface SiteInfo {
  languages: string[];
  primaryLanguage: string;
  name?: string;
}

export interface PostPage {
  data: Post[];
  meta: { page: number; perPage: number; total: number };
}

export interface Facet {
  name: string;
  count: number;
}

export interface ListQuery {
  page?: number;
  perPage?: number;
  tag?: string;
  category?: string;
  q?: string;
  includeContent?: boolean;
  /** Only posts in this language. Leave out for every language (and on single-language sites). */
  lang?: string;
}

/** The blog is not connected yet: no key, or VOX refused it. Pages show setup steps instead of failing. */
export class VoxSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VoxSetupError";
  }
}

const API_URL = (process.env.VOX_API_URL || "https://api.vox.bd").replace(/\/+$/, "");
const REVALIDATE_SECONDS = 300;
export const CACHE_TAG = "vox";

async function request(path: string): Promise<Response> {
  const key = process.env.VOX_API_KEY;
  if (!key) throw new VoxSetupError("VOX_API_KEY is not set.");
  const res = await fetch(`${API_URL}/public/v1${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAG] },
  });
  if (res.status === 401 || res.status === 403) {
    const body = (await res.json().catch(() => null)) as { detail?: string } | null;
    throw new VoxSetupError(`VOX refused the key (${res.status}${body?.detail ? `: ${body.detail}` : ""}).`);
  }
  return res;
}

async function json<T>(path: string): Promise<T> {
  const res = await request(path);
  if (!res.ok) throw new Error(`VOX API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export async function getPosts(q: ListQuery = {}): Promise<PostPage> {
  const params = new URLSearchParams();
  params.set("page", String(q.page ?? 1));
  params.set("perPage", String(Math.min(50, q.perPage ?? 10)));
  if (q.tag) params.set("tag", q.tag);
  if (q.category) params.set("category", q.category);
  if (q.q) params.set("q", q.q);
  if (q.includeContent) params.set("include", "content");
  if (q.lang) params.set("lang", q.lang);
  return json<PostPage>(`/posts?${params}`);
}

/** One post with its body, or null when it does not exist or is not published. `lang` picks one when slugs repeat. */
export async function getPost(slug: string, lang?: string): Promise<Post | null> {
  const res = await request(`/posts/${encodeURIComponent(slug)}${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`VOX API ${res.status} for post ${slug}`);
  return ((await res.json()) as { data: Post }).data;
}

const langQuery = (lang?: string) => (lang ? `?lang=${encodeURIComponent(lang)}` : "");
export const getTags = async (lang?: string) => (await json<{ data: Facet[] }>(`/tags${langQuery(lang)}`)).data;
export const getCategories = async (lang?: string) => (await json<{ data: Facet[] }>(`/categories${langQuery(lang)}`)).data;

/**
 * The website's languages, or null when the API has no /site endpoint yet (404), the key is missing or refused, or
 * the call fails for any other reason. Callers fall back to a single language (see lib/i18n.ts).
 */
export async function getSite(): Promise<SiteInfo | null> {
  try {
    const res = await request("/site");
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: Partial<SiteInfo> } & Partial<SiteInfo>;
    const site = body.data ?? body;
    if (!Array.isArray(site.languages) || site.languages.length === 0) return null;
    const languages = site.languages.filter((l): l is string => typeof l === "string" && l.trim() !== "");
    if (languages.length === 0) return null;
    return { languages, primaryLanguage: typeof site.primaryLanguage === "string" ? site.primaryLanguage : languages[0], name: site.name };
  } catch {
    return null;
  }
}

/** Every published post (pages through the API), newest first. For the sitemap and feeds. */
export async function getAllPosts(limit = 5000, lang?: string): Promise<Post[]> {
  const out: Post[] = [];
  for (let page = 1; out.length < limit; page++) {
    const res = await getPosts({ page, perPage: 50, lang });
    out.push(...res.data);
    if (page * res.meta.perPage >= res.meta.total || res.data.length === 0) break;
  }
  return out.slice(0, limit);
}
