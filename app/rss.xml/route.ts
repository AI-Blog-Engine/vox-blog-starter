import { getLocale } from "@/lib/i18n";
import { rssResponse } from "@/lib/rss";

export const revalidate = 900;

/** The primary language's feed (the only one on a single-language site). Other languages: /<lang>/rss.xml. */
export async function GET() {
  return rssResponse(await getLocale(null));
}
