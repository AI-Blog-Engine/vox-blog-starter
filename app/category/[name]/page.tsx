import type { Metadata } from "next";

import { Listing } from "@/components/listing";
import { pageParam } from "@/lib/safe";
import { categoryPath, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ name: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent((await params).name);
  return { title: name, description: `Articles about ${name} on ${SITE_NAME}.`, alternates: { canonical: categoryPath(name) } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const name = decodeURIComponent((await params).name);
  return <Listing kind="category" name={name} page={pageParam((await searchParams).page)} basePath={categoryPath(name)} />;
}
