import { load } from "@/lib/safe";
import { canonicalFor, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getAllPosts } from "@/lib/vox";

export const revalidate = 3600;

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

/** llms.txt (https://llmstxt.org): what this blog is and every article, for AI assistants. */
export async function GET() {
  const res = await load(() => getAllPosts(1000));
  const posts = res.ok ? res.data : [];
  const body = [
    `# ${oneLine(SITE_NAME)}`,
    "",
    `> ${oneLine(SITE_DESCRIPTION)}`,
    "",
    "## Articles",
    "",
    ...posts.map((p) => `- [${oneLine(p.title).replace(/([[\]\\])/g, "\\$1")}](${canonicalFor(p)})${p.excerpt ? `: ${oneLine(p.excerpt)}` : ""}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "content-type": "text/markdown; charset=utf-8" } });
}
