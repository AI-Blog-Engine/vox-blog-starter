import type { Metadata } from "next";

import { Chips } from "@/components/chips";
import { SetupNotice } from "@/components/setup-notice";
import { load } from "@/lib/safe";
import { tagPath } from "@/lib/site";
import { getTags } from "@/lib/vox";

export const revalidate = 300;
export const metadata: Metadata = { title: "Tags", alternates: { canonical: "/tags" } };

export default async function TagsPage() {
  const res = await load(getTags);
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const items = [...res.data].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <section className="wrap listing">
      <h1 className="listing-title">Tags</h1>
      <p className="listing-count">{items.length === 0 ? "No tags yet." : `${items.length} ${items.length === 1 ? "tag" : "tags"}, A to Z`}</p>
      <Chips items={items} href={tagPath} label="Tags" />
    </section>
  );
}
