import type { Metadata } from "next";

import { categoriesMetadata, CategoriesView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return categoriesMetadata(await getLocale(null));
}

export default async function Page() {
  return <CategoriesView locale={await getLocale(null)} />;
}
