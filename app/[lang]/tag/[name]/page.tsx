import type { Metadata } from "next";

import { tagMetadata, TagView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; name: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return tagMetadata(await getLocale((await params).lang), (await params).name);
}

export default async function Page({ params, searchParams }: Props) {
  return <TagView locale={await getLocale((await params).lang)} rawName={(await params).name} searchParams={await searchParams} />;
}
