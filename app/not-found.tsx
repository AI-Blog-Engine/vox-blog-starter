import Link from "next/link";

import { SearchForm } from "@/components/search-form";

export default function NotFound() {
  return (
    <section className="wrap empty">
      <h1>This page does not exist</h1>
      <p>The article may have moved or been unpublished. Search for it, or start from the latest articles.</p>
      <SearchForm large />
      <p><Link href="/">Go to the latest articles</Link></p>
    </section>
  );
}
