#!/usr/bin/env node
/**
 * A tiny stand-in for the VOX Public API, for trying the blog (and its languages) without a VOX account.
 *
 *   node scripts/mock-vox.mjs                 # Bangla + English site on http://localhost:4010
 *   MOCK_SINGLE=1 node scripts/mock-vox.mjs   # an older API: no /site endpoint, English posts only
 *
 * Then run the blog against it:
 *
 *   VOX_API_URL=http://localhost:4010 VOX_API_KEY=be_pub_mock npm run dev
 *
 * Serves /public/v1/site, /posts (page, perPage, tag, category, q, lang, include=content), /posts/:slug (?lang=),
 * /tags and /categories (?lang=). Any bearer key starting with be_pub_ is accepted. Node only, no dependencies.
 */
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 4010);
const SINGLE = process.env.MOCK_SINGLE === "1";

const seo = (title, description) => ({
  metaTitle: title,
  metaDescription: description,
  canonicalUrl: null,
  jsonLd: [{ "@context": "https://schema.org", "@type": "BlogPosting", headline: title }],
});
const author = { name: "Nadia Rahman", url: null, bio: "Writes about small businesses and the web." };

const POSTS = [
  {
    id: "p1-bn",
    slug: "online-business-shuru",
    title: "অনলাইন ব্যবসা শুরু করার সহজ উপায়",
    excerpt: "কম খরচে, ধাপে ধাপে কীভাবে একটি অনলাইন ব্যবসা দাঁড় করাবেন।",
    keyword: "অনলাইন ব্যবসা",
    tags: ["ব্যবসা", "শুরু"],
    categories: ["উদ্যোক্তা"],
    language: "bn",
    publishedAt: "2026-11-10T08:00:00Z",
    updatedAt: "2026-11-12T08:00:00Z",
    wordCount: 900,
    group: "g1",
    html: "<h2>কেন এখনই শুরু করবেন</h2><p>বাংলাদেশে অনলাইন কেনাকাটা প্রতি বছর বাড়ছে। ছোট একটি দোকানও এখন সারা দেশে বিক্রি করতে পারে।</p><h2>প্রথম ধাপ</h2><p>একটি পণ্য বেছে নিন, একটি পেজ খুলুন, আর প্রথম দশজন ক্রেতার কথা শুনুন।</p>",
  },
  {
    id: "p1-en",
    slug: "start-an-online-business",
    title: "The simple way to start an online business",
    excerpt: "How to set up an online business step by step, on a small budget.",
    keyword: "start an online business",
    tags: ["business", "getting started"],
    categories: ["Entrepreneurship"],
    language: "en",
    publishedAt: "2026-11-11T08:00:00Z",
    updatedAt: "2026-11-11T08:00:00Z",
    wordCount: 850,
    group: "g1",
    html: "<h2>Why start now</h2><p>Online shopping in Bangladesh grows every year. A small shop can now sell across the country.</p><h2>The first step</h2><p>Pick one product, open one page, and listen to your first ten customers.</p>",
  },
  {
    id: "p2-bn",
    slug: "facebook-page-tips",
    title: "ফেসবুক পেজে বিক্রি বাড়ানোর ৫টি কৌশল",
    excerpt: "ছবি, দাম আর দ্রুত উত্তর: যে তিনটি জিনিস ক্রেতা সবচেয়ে বেশি দেখে।",
    keyword: "ফেসবুক পেজ",
    tags: ["মার্কেটিং"],
    categories: ["উদ্যোক্তা"],
    language: "bn",
    publishedAt: "2026-11-05T08:00:00Z",
    updatedAt: "2026-11-05T08:00:00Z",
    wordCount: 600,
    group: "g2",
    html: "<h2>পরিষ্কার ছবি</h2><p>দিনের আলোয় তোলা ছবি সবচেয়ে ভালো কাজ করে।</p>",
  },
  {
    id: "p3-en",
    slug: "pricing-for-beginners",
    title: "Pricing for beginners",
    excerpt: "A simple way to set a price that covers your costs and still sells.",
    keyword: "pricing",
    tags: ["business"],
    categories: ["Entrepreneurship"],
    language: "en",
    publishedAt: "2026-11-01T08:00:00Z",
    updatedAt: "2026-11-01T08:00:00Z",
    wordCount: 500,
    group: "g3",
    html: "<h2>Start from your costs</h2><p>Add up what one sale costs you, then add the margin you need.</p>",
  },
];

const visible = () => (SINGLE ? POSTS.filter((p) => p.language === "en") : POSTS);

/** A post as the API returns it. */
function shape(p, withContent) {
  const { group, html, ...rest } = p;
  const out = {
    ...rest,
    coverImageUrl: null,
    url: `https://example.com${p.language === "bn" ? "" : `/${p.language}`}/blog/${p.slug}`,
    author,
    seo: seo(p.title, p.excerpt),
  };
  if (!SINGLE) {
    out.translations = POSTS.filter((o) => o.group === group && o.id !== p.id).map((o) => ({
      language: o.language,
      slug: o.slug,
      url: `https://example.com${o.language === "bn" ? "" : `/${o.language}`}/blog/${o.slug}`,
    }));
  }
  if (withContent) Object.assign(out, { html, markdown: html.replace(/<[^>]+>/g, "") });
  return out;
}

function facets(posts, key) {
  const counts = new Map();
  for (const p of posts) for (const v of p[key]) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count }));
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const auth = req.headers.authorization ?? "";
  console.log(req.method, url.pathname + url.search);
  if (!auth.startsWith("Bearer be_pub_")) return send(res, 401, { detail: "missing or invalid public key" });

  const path = url.pathname.replace(/^\/public\/v1/, "");
  const lang = url.searchParams.get("lang");
  const inLang = (p) => !lang || p.language === lang;

  if (path === "/site") {
    if (SINGLE) return send(res, 404, { detail: "not found" });
    return send(res, 200, { languages: ["bn", "en"], primaryLanguage: "bn", name: "Mock Blog" });
  }
  if (path === "/posts") {
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const tag = url.searchParams.get("tag");
    const category = url.searchParams.get("category");
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const perPage = Math.min(50, Math.max(1, Number(url.searchParams.get("perPage")) || 10));
    const all = visible()
      .filter(inLang)
      .filter((p) => !tag || p.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
      .filter((p) => !category || p.categories.some((c) => c.toLowerCase() === category.toLowerCase()))
      .filter((p) => !q || `${p.title} ${p.excerpt} ${p.html}`.toLowerCase().includes(q))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    const data = all.slice((page - 1) * perPage, page * perPage).map((p) => shape(p, url.searchParams.get("include") === "content"));
    return send(res, 200, { data, meta: { page, perPage, total: all.length } });
  }
  const one = path.match(/^\/posts\/([^/]+)$/);
  if (one) {
    const slug = decodeURIComponent(one[1]);
    const post = visible().find((p) => (p.slug === slug || p.id === slug) && inLang(p));
    return post ? send(res, 200, { data: shape(post, true) }) : send(res, 404, { detail: "not found" });
  }
  if (path === "/tags") return send(res, 200, { data: facets(visible().filter(inLang), "tags") });
  if (path === "/categories") return send(res, 200, { data: facets(visible().filter(inLang), "categories") });
  return send(res, 404, { detail: "not found" });
});

server.listen(PORT, () => console.log(`Mock VOX API on http://localhost:${PORT} (${SINGLE ? "single language, no /site" : "bn + en"})`));
