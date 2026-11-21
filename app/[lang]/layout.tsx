import type { Metadata } from "next";

import { shellMetadata, SiteShell } from "@/components/site-shell";
import { getLocale } from "@/lib/i18n";

import "../globals.css";

/**
 * Root layout of /<lang>/… on a multi-language site. An unknown language falls back to the primary here, so the 404
 * that its page raises still renders inside the site's frame.
 */
type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  return shellMetadata(await getLocale((await params).lang, { soft: true }));
}

export default async function LangLayout({ children, params }: Props) {
  return <SiteShell locale={await getLocale((await params).lang, { soft: true })}>{children}</SiteShell>;
}
