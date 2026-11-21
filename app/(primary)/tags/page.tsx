import type { Metadata } from "next";

import { tagsMetadata, TagsView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return tagsMetadata(await getLocale(null));
}

export default async function Page() {
  return <TagsView locale={await getLocale(null)} />;
}
