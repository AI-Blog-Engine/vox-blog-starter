import type { Locale } from "./i18n";
import { load } from "./safe";
import { canonicalFor, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";
import { getPosts } from "./vox";

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/** RSS 2.0 of a language's latest 30 articles with their full text, linking to this site. */
export async function rssResponse(locale: Locale): Promise<Response> {
  const res = await load(() => getPosts({ perPage: 30, includeContent: true, lang: locale.apiLang }));
  const items = res.ok
    ? res.data.data
        .map((p) => {
          const link = xml(canonicalFor(p, locale));
          return [
            "<item>",
            `<title>${xml(p.title)}</title>`,
            `<link>${link}</link>`,
            `<guid isPermaLink="true">${link}</guid>`,
            p.publishedAt ? `<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>` : "",
            `<description>${xml(p.excerpt)}</description>`,
            ...p.categories.map((c) => `<category>${xml(c)}</category>`),
            `<content:encoded>${cdata(`<h1>${xml(p.title)}</h1>${p.html ?? ""}`)}</content:encoded>`,
            "</item>",
          ].join("");
        })
        .join("")
    : "";
  const home = `${SITE_URL}${locale.prefix}/`;
  const body =
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel>` +
    `<title>${xml(SITE_NAME)}</title><link>${xml(home)}</link><description>${xml(SITE_DESCRIPTION)}</description><language>${xml(locale.lang)}</language>` +
    `<atom:link href="${xml(`${SITE_URL}${locale.prefix}/rss.xml`)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(body, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
