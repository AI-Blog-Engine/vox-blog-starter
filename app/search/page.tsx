import type { Metadata } from "next";

import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { SearchForm } from "@/components/search-form";
import { SetupNotice } from "@/components/setup-notice";
import { load, pageParam } from "@/lib/safe";
import { POSTS_PER_PAGE } from "@/lib/site";
import { getPosts } from "@/lib/vox";

// Search results are not for search engines.
export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

type Props = { searchParams: Promise<{ q?: string; page?: string }> };

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 200);
  const page = pageParam(sp.page);
  if (q.length < 2) {
    return (
      <section className="wrap listing">
        <h1 className="listing-title">Search</h1>
        <SearchForm large />
      </section>
    );
  }
  const res = await load(() => getPosts({ q, page, perPage: POSTS_PER_PAGE }));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const { data, meta } = res.data;
  return (
    <section className="wrap listing">
      <h1 className="listing-title">Search</h1>
      <SearchForm large defaultValue={q} />
      <p className="listing-count" role="status">
        {meta.total === 0 ? `No articles match "${q}". Try fewer or different words.` : `${meta.total} ${meta.total === 1 ? "article matches" : "articles match"} "${q}", best match first`}
      </p>
      <PostList posts={data} />
      <Pagination page={page} perPage={meta.perPage} total={meta.total} href={(n) => `/search?q=${encodeURIComponent(q)}&page=${n}`} />
    </section>
  );
}
