import { notFound } from "next/navigation";

import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { SetupNotice } from "@/components/setup-notice";
import { load } from "@/lib/safe";
import type { Locale } from "@/lib/i18n";
import { POSTS_PER_PAGE } from "@/lib/site";
import { getPosts } from "@/lib/vox";

/** A category or tag page: a heading with the article count, the list, and paging. */
export async function Listing({ kind, name, page, basePath, locale }: { kind: "category" | "tag"; name: string; page: number; basePath: string; locale: Locale }) {
  const query = { page, perPage: POSTS_PER_PAGE, lang: locale.apiLang };
  const res = await load(() => getPosts(kind === "category" ? { ...query, category: name } : { ...query, tag: name }));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const { data, meta } = res.data;
  if (meta.total === 0) notFound();
  return (
    <section className="wrap listing">
      <p className="listing-kind">{kind === "category" ? "Topic" : "Tag"}</p>
      <h1 className="listing-title">{name}</h1>
      <p className="listing-count">{meta.total} {meta.total === 1 ? "article" : "articles"}</p>
      <PostList posts={data} locale={locale} />
      <Pagination page={page} perPage={meta.perPage} total={meta.total} href={(n) => (n === 1 ? basePath : `${basePath}?page=${n}`)} />
    </section>
  );
}
