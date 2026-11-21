import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { SwitcherTargets } from "@/components/language-switcher";
import { PostList } from "@/components/post-list";
import { SetupNotice } from "@/components/setup-notice";
import { formatDate, readingTime } from "@/lib/format";
import { dirFor, languageName, localeOf, type Locale } from "@/lib/i18n";
import { load } from "@/lib/safe";
import { canonicalFor, categoryPath, homePath, languageAlternates, postHref, tagPath, translationLinks } from "@/lib/site";
import { getPost, getPosts, type Post } from "@/lib/vox";

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/**
 * The post for this URL, in the page's language. On a multi-language site a slug that only exists in another
 * language (an old link) is looked up again without the language; `moved` then says the page should redirect to
 * that post's own URL. (Only then: if the API ignores ?lang=, the first lookup always answers, so this never loops.)
 */
const findPost = cache(async (rawSlug: string, apiLang: string | undefined): Promise<{ post: Post; moved: boolean } | null> => {
  const slug = safeDecode(rawSlug);
  const post = await getPost(slug, apiLang);
  if (post) return { post, moved: false };
  if (!apiLang) return null;
  const other = await getPost(slug);
  return other ? { post: other, moved: other.language?.toLowerCase() !== apiLang } : null;
});

export async function postMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const res = await load(() => findPost(slug, locale.apiLang));
  if (!res.ok || !res.data) return {};
  const { post } = res.data;
  const canonical = canonicalFor(post, locale);
  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription || post.excerpt,
    alternates: { canonical, languages: languageAlternates(post, locale) },
    keywords: post.tags,
    authors: post.author ? [{ name: post.author.name, url: post.author.url ?? undefined }] : undefined,
    openGraph: {
      type: "article",
      title: post.seo.metaTitle,
      description: post.seo.metaDescription || post.excerpt,
      url: canonical,
      locale: post.language || locale.lang,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: { card: post.coverImageUrl ? "summary_large_image" : "summary" },
  };
}

/**
 * The JSON-LD from VOX, pointed at this page: the BlogPosting's url / mainEntityOfPage become this site's canonical,
 * so search engines see one consistent address, and it names the article's language.
 */
function jsonLdFor(post: Post, locale: Locale) {
  const canonical = canonicalFor(post, locale);
  return post.seo.jsonLd.map((block) =>
    block["@type"] === "BlogPosting" ? { ...block, url: canonical, mainEntityOfPage: canonical, inLanguage: block.inLanguage ?? post.language ?? locale.lang } : block,
  );
}

export async function PostView({ locale, slug }: { locale: Locale; slug: string }) {
  const res = await load(() => findPost(slug, locale.apiLang));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  if (!res.data) notFound();
  const { post, moved } = res.data;
  if (moved && locale.languages.includes(post.language?.toLowerCase())) redirect(postHref(post, locale));

  const topic = post.categories[0];
  const related = topic
    ? (await getPosts({ category: topic, perPage: 4, lang: locale.apiLang })).data.filter((p) => p.id !== post.id).slice(0, 3)
    : [];

  // The switcher goes to this article's translations, else to that language's home page.
  const translations = locale.multi ? translationLinks(post, locale) : [];
  const targets: Record<string, string> = Object.fromEntries(locale.languages.map((l) => [l, homePath(localeOf(l, locale).prefix)]));
  targets[locale.lang] = postHref(post, locale);
  for (const t of translations) targets[t.lang] = t.href;

  return (
    <article className="article">
      {locale.multi && <SwitcherTargets targets={targets} />}
      <header className="wrap article-head">
        {topic && <Link href={categoryPath(topic, locale.prefix)} className="article-topic">{topic}</Link>}
        <h1 className={post.title.length > 60 ? "article-title article-title-long" : "article-title"}>{post.title}</h1>
        {post.excerpt && <p className="article-standfirst">{post.excerpt}</p>}
        <p className="article-meta">
          {post.author && <span className="article-author">{post.author.url ? <a href={post.author.url} rel="author">{post.author.name}</a> : post.author.name}</span>}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
          <span>{readingTime(post.wordCount)}</span>
        </p>
        {translations.length > 0 && (
          <p className="article-langs">
            <span>Also in</span>
            {translations.map((t) => (
              <a key={t.lang} href={t.href} hrefLang={t.lang} lang={t.lang} dir={dirFor(t.lang)} rel="alternate">{languageName(t.lang)}</a>
            ))}
          </p>
        )}
      </header>

      {post.coverImageUrl && (
        <figure className="article-cover wrap">
          {/* eslint-disable-next-line @next/next/no-img-element -- covers come from any host */}
          <img src={post.coverImageUrl} alt="" width={1200} height={630} />
        </figure>
      )}

      <div className="wrap article-grid">
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html ?? "" }} />
        <aside className="article-aside" aria-label="About this article">
          {post.tags.length > 0 && (
            <div>
              <h2 className="aside-title">Tags</h2>
              <ul className="taglist">
                {post.tags.map((t) => <li key={t}><Link href={tagPath(t, locale.prefix)}>{t}</Link></li>)}
              </ul>
            </div>
          )}
          {post.author?.bio && (
            <div>
              <h2 className="aside-title">About the author</h2>
              <p className="aside-text">{post.author.bio}</p>
            </div>
          )}
          {post.updatedAt && post.publishedAt && post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10) && (
            <p className="aside-text">Updated {formatDate(post.updatedAt)}</p>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="wrap related" aria-labelledby="related-title">
          <h2 id="related-title" className="section-title">More in {topic}</h2>
          <PostList posts={related} locale={locale} />
        </section>
      )}

      {jsonLdFor(post, locale).map((block, i) => (
        // JSON from VOX; "<" is escaped so a value can never close the script tag.
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }} />
      ))}
    </article>
  );
}
