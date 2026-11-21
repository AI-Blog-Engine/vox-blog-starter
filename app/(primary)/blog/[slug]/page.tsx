import type { Metadata } from "next";

import { postMetadata, PostView } from "@/components/pages/post";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return postMetadata(await getLocale(null), (await params).slug);
}

export default async function PostPage({ params }: Props) {
  return <PostView locale={await getLocale(null)} slug={(await params).slug} />;
}
