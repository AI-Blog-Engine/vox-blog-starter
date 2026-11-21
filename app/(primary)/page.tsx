import type { Metadata } from "next";

import { homeMetadata, HomeView } from "@/components/pages/home";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata(await getLocale(null));
}

export default async function Home({ searchParams }: Props) {
  return <HomeView locale={await getLocale(null)} searchParams={await searchParams} />;
}
