import { searchMetadata, SearchView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const metadata = searchMetadata;

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  return <SearchView locale={await getLocale(null)} searchParams={await searchParams} />;
}
