import { searchMetadata, SearchView } from "@/components/pages/lists";
import { getLocale } from "@/lib/i18n";

export const metadata = searchMetadata;

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ params, searchParams }: Props) {
  return <SearchView locale={await getLocale((await params).lang)} searchParams={await searchParams} />;
}
