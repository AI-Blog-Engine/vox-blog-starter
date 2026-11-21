# VOX blog starter

A fast, SEO-ready blog for the articles you write and publish with [VOX](https://vox.bd). Clone it, add your API key,
deploy. Live demo: **https://demo.vox.bd**

- **Pages:** home (newest article first, then the latest), a page per article, topics (categories), tags, search, and a
  helpful 404.
- **SEO built in:** title, description, canonical and Open Graph tags on every page; the article's schema.org JSON-LD;
  `sitemap.xml`, `robots.txt`, an RSS feed with full text, and `llms.txt` for AI assistants.
- **Multilingual:** one language or several (Bangla and English, say), with a language switcher, `hreflang` and the
  right `<html lang>` / `dir` on every page. See [Languages](#languages).
- **Fresh without effort:** pages are cached for five minutes; add a VOX webhook and new articles appear instantly.
- **Small:** Next.js and React only. No CSS framework, no database, no tracking.

## Run it locally

You need Node.js 20.9 or newer and a VOX public key.

1. **Get a key.** Sign in at [app.vox.bd](https://app.vox.bd), open **Settings → Public API**, choose your website and
   create a public key. It starts with `be_pub_` and is shown once.
2. **Configure.**

   ```bash
   git clone https://github.com/AI-Blog-Engine/vox-blog-starter.git my-blog
   cd my-blog
   cp .env.example .env.local
   ```

   Open `.env.local` and set `VOX_API_KEY`, `SITE_NAME` and `SITE_DESCRIPTION`.
3. **Start.**

   ```bash
   npm install
   npm run build && npm start
   ```

   Open http://localhost:3000. (`npm run dev` works too for editing.)

## Settings

All settings are environment variables (see `.env.example`).

| Variable | Required | What it does |
|---|---|---|
| `VOX_API_KEY` | yes | Your public key (`be_pub_…`). Used on the server only. |
| `SITE_URL` | yes in production | This blog's address, e.g. `https://blog.example.com`. Used for canonical URLs, the sitemap and RSS. |
| `SITE_NAME`, `SITE_DESCRIPTION` | no | Shown in the header, titles and feeds. |
| `VOX_API_URL` | no | Defaults to `https://api.vox.bd`. |
| `VOX_WEBHOOK_SECRET` | no | Enables instant updates (below). |
| `VOX_USE_API_CANONICAL` | no | `true` = use the canonical URL stored in VOX instead of `SITE_URL/blog/<slug>`. |
| `VOX_LANGUAGES` | no | The site's languages, e.g. `bn,en` (first = primary). Only a fallback for when VOX does not report them; see below. |

**Canonical URLs.** Articles live at `/blog/<slug>`, and by default their canonical URL is this site's own address. If
you also publish the same articles somewhere else, set the website's domain and blog path in VOX to this site's and set
`VOX_USE_API_CANONICAL=true`, so search engines see one address per article.

## Languages

The blog asks VOX for the website's languages (`GET /public/v1/site`, ordered, the first is the primary).

- **One language** (most sites): nothing changes. Articles are at `/blog/<slug>`, there is no switcher, and
  `<html lang>` is the site's language (`bn`, `en`, …).
- **Several languages:** each one gets its own pages under a prefix: `/en/`, `/en/blog/<slug>`, `/en/category/…`,
  `/en/tag/…`, `/en/tags`, `/en/categories`, `/en/search` and `/en/rss.xml`. The primary language stays at the
  unprefixed URLs (`/`, `/blog/<slug>`, `/rss.xml`), which are its canonical addresses (`/bn/…` also works for it).
  - A language switcher in the header shows each language by its native name (বাংলা, English, हिन्दी, اردو, العربية,
    …). On an article it goes to that article's translation, or to the language's home page when there is none.
  - Each article lists its translations ("Also in …") and names them in `<head>` as
    `<link rel="alternate" hreflang="…">`, with `x-default` pointing at the primary language's version. The sitemap
    carries the same alternates, each feed has its `<language>`, and `llms.txt` lists the articles per language.
  - Arabic and Urdu pages are right-to-left (`dir="rtl"`). Bangla uses Noto Sans / Serif Bengali (in the same Google
    Fonts link), downloaded only by pages that contain Bengali text.

If VOX does not answer `/site` (an older API, or a network error), the blog uses `VOX_LANGUAGES` (`bn,en`), else a
single language: the newest article's, else `en`. On one-language sites it never sends `?lang=` to the API, so it
asks VOX exactly what it always did.

The interface text ("Latest articles", "Search", …) is English; change it in `components/` if you write in another
language.

## Try it without a VOX account

`scripts/mock-vox.mjs` is a tiny stand-in for the VOX API (Node only) with two Bangla and two English articles, one of
them translated:

```bash
node scripts/mock-vox.mjs                                   # http://localhost:4010, Bangla (primary) + English
VOX_API_URL=http://localhost:4010 VOX_API_KEY=be_pub_mock npm run dev
```

`MOCK_SINGLE=1 node scripts/mock-vox.mjs` plays an older API: English only, no `/site` endpoint.

## Instant updates with a webhook

In VOX: **Websites → your site → Publishing → Add webhook**, URL `https://<your blog>/api/revalidate`. Copy the
signing secret it shows into `VOX_WEBHOOK_SECRET` and redeploy. Every publish, edit or unpublish now refreshes the
blog within seconds; the signature is checked on every call.

## Deploy

- **Vercel / Netlify:** import the repository, add the environment variables, deploy.
- **Docker (Coolify, Railway, Fly, any server):**

  ```bash
  docker build -t my-blog .
  docker run -p 3000:3000 --env-file .env.local my-blog
  ```

  In Coolify, use the *Dockerfile* build pack, port `3000`, and add the variables under *Environment Variables*.

## Make it yours

- **Colours and fonts:** the tokens at the top of `app/globals.css` (`--paper`, `--ink`, `--accent` and the rest), with
  a dark scheme below them. Fonts are loaded from Google Fonts in `components/site-shell.tsx`; change the URL or
  self-host them.
- **Layout:** the pages are in `components/pages/` (home, article, lists and search) and the header and footer in
  `components/site-shell.tsx`. `app/(primary)/` (unprefixed URLs) and `app/[lang]/` (`/<lang>/…`) only route to them.
  `components/` also has the list, chips, paging, search and the language switcher.
- **Languages:** `lib/i18n.ts` (the language list, native names, right-to-left languages, the fallbacks).
- **Data:** `lib/vox.ts` is the whole API client: every field the API returns is typed there. The API reference is at
  [vox.bd/docs](https://vox.bd/docs).

A note on article HTML: it is inserted as is. Articles written by VOX's AI are generated Markdown; if people you don't
trust can write posts in your VOX workspace, sanitize `post.html` (for example with DOMPurify) before rendering it.

## License

MIT
