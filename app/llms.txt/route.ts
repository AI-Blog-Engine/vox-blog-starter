import { getSiteLanguages, languageName } from "@/lib/i18n";
import { load } from "@/lib/safe";
import { canonicalFor, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getAllPosts, type Post } from "@/lib/vox";

export const revalidate = 3600;

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * llms.txt (https://llmstxt.org): what this blog is and every article, for AI assistants. On a multi-language site
 * the articles are grouped by language, primary first.
 */
export async function GET() {
  const site = await getSiteLanguages();
  const res = await load(() => getAllPosts(1000));
  const posts = res.ok ? res.data : [];
  const line = (p: Post) => `- [${oneLine(p.title).replace(/([[\]\\])/g, "\\$1")}](${canonicalFor(p, site)})${p.excerpt ? `: ${oneLine(p.excerpt)}` : ""}`;

  let sections: string[];
  if (!site.multi) {
    sections = ["## Articles", "", ...posts.map(line), ""];
  } else {
    const langOf = (p: Post) => (site.languages.includes(p.language?.toLowerCase()) ? p.language.toLowerCase() : site.primary);
    sections = site.languages.flatMap((lang) => {
      const mine = posts.filter((p) => langOf(p) === lang);
      return mine.length === 0 ? [] : [`## Articles in ${languageName(lang)} (${lang})`, "", ...mine.map(line), ""];
    });
  }
  const body = [`# ${oneLine(SITE_NAME)}`, "", `> ${oneLine(SITE_DESCRIPTION)}`, "", ...sections].join("\n");
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
