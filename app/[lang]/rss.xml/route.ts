import { getLocale } from "@/lib/i18n";
import { rssResponse } from "@/lib/rss";

export const revalidate = 900;

/** One language's feed on a multi-language site; 404 for a language the site does not have. */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  return rssResponse(await getLocale((await params).lang));
}
