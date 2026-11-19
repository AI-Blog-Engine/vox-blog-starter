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
  seo: { metaTitle: string; metaDescription: string; canonicalUrl: string | null; jsonLd: Record<string, unknown>[] };
  /** Only on a single post, or a list with include=content. Starts at the first <h2>: render the title yourself. */
  html?: string;
  markdown?: string;
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
  return json<PostPage>(`/posts?${params}`);
}

/** One post with its body, or null when it does not exist or is not published. */
export async function getPost(slug: string): Promise<Post | null> {
  const res = await request(`/posts/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`VOX API ${res.status} for post ${slug}`);
  return ((await res.json()) as { data: Post }).data;
}

export const getTags = async () => (await json<{ data: Facet[] }>("/tags")).data;
export const getCategories = async () => (await json<{ data: Facet[] }>("/categories")).data;

/** Every published post (pages through the API), newest first. For the sitemap and feeds. */
export async function getAllPosts(limit = 5000): Promise<Post[]> {
  const out: Post[] = [];
  for (let page = 1; out.length < limit; page++) {
    const res = await getPosts({ page, perPage: 50 });
    out.push(...res.data);
    if (page * res.meta.perPage >= res.meta.total || res.data.length === 0) break;
  }
  return out.slice(0, limit);
}
