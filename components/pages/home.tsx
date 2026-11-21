import type { Metadata } from "next";
import Link from "next/link";

import { Chips } from "@/components/chips";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { SetupNotice } from "@/components/setup-notice";
import { formatDate, readingTime } from "@/lib/format";
import { localeOf, type Locale } from "@/lib/i18n";
import { load, pageParam } from "@/lib/safe";
import { categoryPath, homePath, POSTS_PER_PAGE, postHref, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { getCategories, getPosts } from "@/lib/vox";

/** On a multi-language site, each language's home page names the others (hreflang). Nothing extra otherwise. */
export function homeMetadata(locale: Locale): Metadata {
  if (!locale.multi) return {};
  const languages: Record<string, string> = Object.fromEntries(locale.languages.map((l) => [l, homePath(localeOf(l, locale).prefix)]));
  languages["x-default"] = "/";
  return { alternates: { canonical: homePath(locale.prefix), languages, types: { "application/rss+xml": `${locale.prefix}/rss.xml` } } };
}

export async function HomeView({ locale, searchParams }: { locale: Locale; searchParams: { page?: string } }) {
  const page = pageParam(searchParams.page);
  const { prefix, apiLang } = locale;
  const res = await load(async () => {
    const [posts, categories] = await Promise.all([
      getPosts({ page, perPage: POSTS_PER_PAGE, lang: apiLang }),
      page === 1 ? getCategories(apiLang) : Promise.resolve([]),
    ]);
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

  const topicHref = (name: string) => categoryPath(name, prefix);
  // The newest article leads page one; the rest follow as an index.
  const [lead, ...rest] = page === 1 ? posts.data : [undefined, ...posts.data];
  return (
    <>
      {lead && (
        <section className="lead wrap" aria-labelledby="lead-title">
          <div className="lead-text">
            <p className="lead-meta">
              {lead.categories[0] && <Link href={topicHref(lead.categories[0])}>{lead.categories[0]}</Link>}
              <time dateTime={lead.publishedAt ?? undefined}>{formatDate(lead.publishedAt)}</time>
              <span>{readingTime(lead.wordCount)}</span>
            </p>
            <h1 id="lead-title" className={lead.title.length > 60 ? "lead-title lead-title-long" : "lead-title"}><Link href={postHref(lead, locale)}>{lead.title}</Link></h1>
            {lead.excerpt && <p className="lead-excerpt">{lead.excerpt}</p>}
            <Link href={postHref(lead, locale)} className="button">Read the article</Link>
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
          <Chips items={categories} href={topicHref} label="Topics" />
        </section>
      )}

      <section className="wrap" aria-labelledby="latest-title">
        <h2 id="latest-title" className="section-title">{page === 1 ? "Latest articles" : `Articles, page ${page}`}</h2>
        {page !== 1 && <p className="section-sub">{SITE_DESCRIPTION}</p>}
        <PostList posts={rest.filter((p): p is NonNullable<typeof p> => Boolean(p))} locale={locale} />
        <Pagination page={page} perPage={posts.meta.perPage} total={posts.meta.total} href={(n) => (n === 1 ? homePath(prefix) : `${homePath(prefix)}?page=${n}`)} />
      </section>
    </>
  );
}
