import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAG } from "@/lib/vox";

/**
 * VOX webhook: point a webhook at https://<this site>/api/revalidate and set VOX_WEBHOOK_SECRET to its signing
 * secret. A verified article.published / updated / unpublished event refreshes every cached page at once.
 */
export async function POST(req: Request) {
  const secret = process.env.VOX_WEBHOOK_SECRET;
  if (!secret) return new Response("VOX_WEBHOOK_SECRET is not set", { status: 501 });

  const raw = await req.text();
  const ts = Number(req.headers.get("x-blogengine-timestamp"));
  const sig = req.headers.get("x-blogengine-signature") ?? "";
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return new Response("stale or missing timestamp", { status: 400 });

  const expected = `sha256=${createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex")}`;
  const valid = expected.length === sig.length && timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  if (!valid) return new Response("invalid signature", { status: 401 });

  revalidateTag(CACHE_TAG, "max");
  revalidatePath("/", "layout");
  return new Response(null, { status: 204 });
}
