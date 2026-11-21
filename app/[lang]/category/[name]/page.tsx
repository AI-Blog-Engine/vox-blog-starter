import type { Metadata } from "next";

import { categoryMetadata, CategoryView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string; name: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata(await getLocale((await params).lang), (await params).name);
}

export default async function Page({ params, searchParams }: Props) {
  return <CategoryView locale={await getLocale((await params).lang)} rawName={(await params).name} searchParams={await searchParams} />;
}
