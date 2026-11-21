import type { Metadata } from "next";

import { Chips } from "@/components/chips";
import { Listing } from "@/components/listing";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { SearchForm } from "@/components/search-form";
import { SetupNotice } from "@/components/setup-notice";
import type { Locale } from "@/lib/i18n";
import { load, pageParam } from "@/lib/safe";
import { categoryPath, POSTS_PER_PAGE, SITE_NAME, tagPath } from "@/lib/site";
import { getCategories, getPosts, getTags } from "@/lib/vox";

/** Topics, tags, one topic, one tag and search: the same pages in every language, under the locale's prefix. */

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function categoryMetadata(locale: Locale, rawName: string): Metadata {
  const name = decode(rawName);
  return { title: name, description: `Articles about ${name} on ${SITE_NAME}.`, alternates: { canonical: categoryPath(name, locale.prefix) } };
}

export function CategoryView({ locale, rawName, searchParams }: { locale: Locale; rawName: string; searchParams: { page?: string } }) {
  const name = decode(rawName);
  return <Listing kind="category" name={name} page={pageParam(searchParams.page)} basePath={categoryPath(name, locale.prefix)} locale={locale} />;
}

export function tagMetadata(locale: Locale, rawName: string): Metadata {
  const name = decode(rawName);
  return { title: `Tagged ${name}`, description: `Articles tagged ${name} on ${SITE_NAME}.`, alternates: { canonical: tagPath(name, locale.prefix) } };
}

export function TagView({ locale, rawName, searchParams }: { locale: Locale; rawName: string; searchParams: { page?: string } }) {
  const name = decode(rawName);
  return <Listing kind="tag" name={name} page={pageParam(searchParams.page)} basePath={tagPath(name, locale.prefix)} locale={locale} />;
}

export const tagsMetadata = (locale: Locale): Metadata => ({ title: "Tags", alternates: { canonical: `${locale.prefix}/tags` } });

export async function TagsView({ locale }: { locale: Locale }) {
  const res = await load(() => getTags(locale.apiLang));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const items = [...res.data].sort((a, b) => a.name.localeCompare(b.name, locale.lang));
  return (
    <section className="wrap listing">
      <h1 className="listing-title">Tags</h1>
      <p className="listing-count">{items.length === 0 ? "No tags yet." : `${items.length} ${items.length === 1 ? "tag" : "tags"}, A to Z`}</p>
      <Chips items={items} href={(name) => tagPath(name, locale.prefix)} label="Tags" />
    </section>
  );
}

export const categoriesMetadata = (locale: Locale): Metadata => ({ title: "Topics", alternates: { canonical: `${locale.prefix}/categories` } });

export async function CategoriesView({ locale }: { locale: Locale }) {
  const res = await load(() => getCategories(locale.apiLang));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const items = [...res.data].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, locale.lang));
  return (
    <section className="wrap listing">
      <h1 className="listing-title">Topics</h1>
      <p className="listing-count">{items.length === 0 ? "No topics yet." : `${items.length} ${items.length === 1 ? "topic" : "topics"}, most written about first`}</p>
      <Chips items={items} href={(name) => categoryPath(name, locale.prefix)} label="Topics" />
    </section>
  );
}

// Search results are not for search engines.
export const searchMetadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

export async function SearchView({ locale, searchParams }: { locale: Locale; searchParams: { q?: string; page?: string } }) {
  const q = (searchParams.q ?? "").trim().slice(0, 200);
  const page = pageParam(searchParams.page);
  const { prefix } = locale;
  if (q.length < 2) {
    return (
      <section className="wrap listing">
        <h1 className="listing-title">Search</h1>
        <SearchForm large prefix={prefix} />
      </section>
    );
  }
  const res = await load(() => getPosts({ q, page, perPage: POSTS_PER_PAGE, lang: locale.apiLang }));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const { data, meta } = res.data;
  return (
    <section className="wrap listing">
      <h1 className="listing-title">Search</h1>
      <SearchForm large defaultValue={q} prefix={prefix} />
      <p className="listing-count" role="status">
        {meta.total === 0 ? `No articles match "${q}". Try fewer or different words.` : `${meta.total} ${meta.total === 1 ? "article matches" : "articles match"} "${q}", best match first`}
      </p>
      <PostList posts={data} locale={locale} />
      <Pagination page={page} perPage={meta.perPage} total={meta.total} href={(n) => `${prefix}/search?q=${encodeURIComponent(q)}&page=${n}`} />
    </section>
  );
}
