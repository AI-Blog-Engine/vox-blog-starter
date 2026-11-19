import Link from "next/link";

import { Chips } from "@/components/chips";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { SetupNotice } from "@/components/setup-notice";
import { formatDate, readingTime } from "@/lib/format";
import { load, pageParam } from "@/lib/safe";
import { categoryPath, POSTS_PER_PAGE, postPath, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getCategories, getPosts } from "@/lib/vox";

export const revalidate = 300;

type Props = { searchParams: Promise<{ page?: string }> };

export default async function Home({ searchParams }: Props) {
  const page = pageParam((await searchParams).page);
  const res = await load(async () => {
    const [posts, categories] = await Promise.all([getPosts({ page, perPage: POSTS_PER_PAGE }), page === 1 ? getCategories() : Promise.resolve([])]);
    return { posts, categories };
  });
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const { posts, categories } = res.data;

  if (posts.meta.total === 0) {
    return (
      <section className="wrap empty">
        <h1>{SITE_NAME}</h1>
        <p>No articles are published yet. Publish one in VOX and it appears here within a few minutes.</p>
      </section>
    );
  }

  // The newest article leads page one; the rest follow as an index.
  const [lead, ...rest] = page === 1 ? posts.data : [undefined, ...posts.data];
  return (
    <>
      {lead && (
        <section className="lead wrap" aria-labelledby="lead-title">
          <div className="lead-text">
            <p className="lead-meta">
              {lead.categories[0] && <Link href={categoryPath(lead.categories[0])}>{lead.categories[0]}</Link>}
              <time dateTime={lead.publishedAt ?? undefined}>{formatDate(lead.publishedAt)}</time>
              <span>{readingTime(lead.wordCount)}</span>
            </p>
            <h1 id="lead-title" className={lead.title.length > 60 ? "lead-title lead-title-long" : "lead-title"}><Link href={postPath(lead.slug)}>{lead.title}</Link></h1>
            {lead.excerpt && <p className="lead-excerpt">{lead.excerpt}</p>}
            <Link href={postPath(lead.slug)} className="button">Read the article</Link>
          </div>
          {lead.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- covers come from any host
            <img className="lead-cover" src={lead.coverImageUrl} alt="" width={720} height={480} />
          )}
        </section>
      )}

      {page === 1 && categories.length > 0 && (
        <section className="wrap topics" aria-labelledby="topics-title">
          <h2 id="topics-title" className="section-title">Browse by topic</h2>
          <Chips items={categories} href={categoryPath} label="Topics" />
        </section>
      )}

      <section className="wrap" aria-labelledby="latest-title">
        <h2 id="latest-title" className="section-title">{page === 1 ? "Latest articles" : `Articles, page ${page}`}</h2>
        {page !== 1 && <p className="section-sub">{SITE_DESCRIPTION}</p>}
        <PostList posts={rest.filter((p): p is NonNullable<typeof p> => Boolean(p))} />
        <Pagination page={page} perPage={posts.meta.perPage} total={posts.meta.total} href={(n) => (n === 1 ? "/" : `/?page=${n}`)} />
      </section>
    </>
  );
}
