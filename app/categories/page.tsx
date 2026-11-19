import type { Metadata } from "next";

import { Chips } from "@/components/chips";
import { SetupNotice } from "@/components/setup-notice";
import { load } from "@/lib/safe";
import { categoryPath } from "@/lib/site";
import { getCategories } from "@/lib/vox";

export const revalidate = 300;
export const metadata: Metadata = { title: "Topics", alternates: { canonical: "/categories" } };

export default async function CategoriesPage() {
  const res = await load(getCategories);
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const items = [...res.data].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  return (
    <section className="wrap listing">
      <h1 className="listing-title">Topics</h1>
      <p className="listing-count">{items.length === 0 ? "No topics yet." : `${items.length} ${items.length === 1 ? "topic" : "topics"}, most written about first`}</p>
      <Chips items={items} href={categoryPath} label="Topics" />
    </section>
  );
}
