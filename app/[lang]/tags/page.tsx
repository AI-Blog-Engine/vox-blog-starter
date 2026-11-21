import type { Metadata } from "next";

import { tagsMetadata, TagsView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return tagsMetadata(await getLocale((await params).lang));
}

export default async function Page({ params }: Props) {
  return <TagsView locale={await getLocale((await params).lang)} />;
}
