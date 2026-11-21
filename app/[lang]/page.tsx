import type { Metadata } from "next";

import { homeMetadata, HomeView } from "@/components/pages/home";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return homeMetadata(await getLocale((await params).lang));
}

export default async function Home({ params, searchParams }: Props) {
  return <HomeView locale={await getLocale((await params).lang)} searchParams={await searchParams} />;
}
