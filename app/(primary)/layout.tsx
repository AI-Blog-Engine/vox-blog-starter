import type { Metadata } from "next";

import { shellMetadata, SiteShell } from "@/components/site-shell";
import { getLocale } from "@/lib/i18n";

import "../globals.css";

/** Root layout of the unprefixed URLs: the site's primary language (the only one on a single-language site). */
export async function generateMetadata(): Promise<Metadata> {
  return shellMetadata(await getLocale(null));
}

export default async function PrimaryLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale={await getLocale(null)}>{children}</SiteShell>;
}
