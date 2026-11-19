import Link from "next/link";

import type { Facet } from "@/lib/vox";

/** Topics (categories) or tags as links, each with its number of articles. */
export function Chips({ items, href, label }: { items: Facet[]; href: (name: string) => string; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul className="chips" aria-label={label}>
      {items.map((f) => (
        <li key={f.name}>
          <Link href={href(f.name)} className="chip">
            <span>{f.name}</span>
            <span className="chip-count" aria-label={`${f.count} articles`}>{f.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
