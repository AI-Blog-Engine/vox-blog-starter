import type { Metadata } from "next";

import { postMetadata, PostView } from "@/components/pages/post";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata(await getLocale((await params).lang), (await params).slug);
}

export default async function PostPage({ params }: Props) {
  return <PostView locale={await getLocale((await params).lang)} slug={(await params).slug} />;
}
