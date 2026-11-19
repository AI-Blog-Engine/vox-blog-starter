import type { Metadata } from "next";

import { Listing } from "@/components/listing";
import { pageParam } from "@/lib/safe";
import { SITE_NAME, tagPath } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ name: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = decodeURIComponent((await params).name);
  return { title: `Tagged ${name}`, description: `Articles tagged ${name} on ${SITE_NAME}.`, alternates: { canonical: tagPath(name) } };
}

export default async function TagPage({ params, searchParams }: Props) {
  const name = decodeURIComponent((await params).name);
  return <Listing kind="tag" name={name} page={pageParam((await searchParams).page)} basePath={tagPath(name)} />;
}
