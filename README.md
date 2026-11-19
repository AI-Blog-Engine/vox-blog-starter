# VOX blog starter

A fast, SEO-ready blog for the articles you write and publish with [VOX](https://vox.bd). Clone it, add your API key,
deploy. Live demo: **https://demo.vox.bd**

- **Pages:** home (newest article first, then the latest), a page per article, topics (categories), tags, search, and a
  helpful 404.
- **SEO built in:** title, description, canonical and Open Graph tags on every page; the article's schema.org JSON-LD;
  `sitemap.xml`, `robots.txt`, an RSS feed with full text, and `llms.txt` for AI assistants.
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

**Canonical URLs.** Articles live at `/blog/<slug>`, and by default their canonical URL is this site's own address. If
you also publish the same articles somewhere else, set the website's domain and blog path in VOX to this site's and set
`VOX_USE_API_CANONICAL=true`, so search engines see one address per article.

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
  a dark scheme below them. Fonts are loaded from Google Fonts in `app/layout.tsx`; change the URL or self-host them.
- **Layout:** `app/page.tsx` (home), `app/blog/[slug]/page.tsx` (article), `components/` (list, chips, paging, search).
- **Data:** `lib/vox.ts` is the whole API client: every field the API returns is typed there. The API reference is at
  [vox.bd/docs](https://vox.bd/docs).

A note on article HTML: it is inserted as is. Articles written by VOX's AI are generated Markdown; if people you don't
trust can write posts in your VOX workspace, sanitize `post.html` (for example with DOMPurify) before rendering it.

## License

MIT
