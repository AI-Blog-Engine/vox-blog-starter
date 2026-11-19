import { load } from "@/lib/safe";
import { canonicalFor, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { getPosts } from "@/lib/vox";

export const revalidate = 900;

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

/** RSS 2.0 of the latest 30 articles with their full text, linking to this site. */
export async function GET() {
  const res = await load(() => getPosts({ perPage: 30, includeContent: true }));
  const items = res.ok
    ? res.data.data
        .map((p) => {
          const link = xml(canonicalFor(p));
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
  const body =
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom"><channel>` +
    `<title>${xml(SITE_NAME)}</title><link>${xml(SITE_URL)}/</link><description>${xml(SITE_DESCRIPTION)}</description>` +
    `<atom:link href="${xml(SITE_URL)}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(body, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
