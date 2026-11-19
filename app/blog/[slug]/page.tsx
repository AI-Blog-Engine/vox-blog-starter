import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostList } from "@/components/post-list";
import { SetupNotice } from "@/components/setup-notice";
import { formatDate, readingTime } from "@/lib/format";
import { load } from "@/lib/safe";
import { canonicalFor, categoryPath, tagPath } from "@/lib/site";
import { getPost, getPosts, type Post } from "@/lib/vox";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await load(async () => getPost(decodeURIComponent((await params).slug)));
  if (!res.ok || !res.data) return {};
  const post = res.data;
  return {
    title: post.seo.metaTitle,
    description: post.seo.metaDescription || post.excerpt,
    alternates: { canonical: canonicalFor(post) },
    keywords: post.tags,
    authors: post.author ? [{ name: post.author.name, url: post.author.url ?? undefined }] : undefined,
    openGraph: {
      type: "article",
      title: post.seo.metaTitle,
      description: post.seo.metaDescription || post.excerpt,
      url: canonicalFor(post),
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
 * so search engines see one consistent address.
 */
function jsonLdFor(post: Post) {
  const canonical = canonicalFor(post);
  return post.seo.jsonLd.map((block) => (block["@type"] === "BlogPosting" ? { ...block, url: canonical, mainEntityOfPage: canonical } : block));
}

export default async function PostPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const res = await load(() => getPost(slug));
  if (!res.ok) return <SetupNotice reason={res.setup} />;
  const post = res.data;
  if (!post) notFound();

  const topic = post.categories[0];
  const related = topic
    ? (await getPosts({ category: topic, perPage: 4 })).data.filter((p) => p.id !== post.id).slice(0, 3)
    : [];

  return (
    <article className="article">
      <header className="wrap article-head">
        {topic && <Link href={categoryPath(topic)} className="article-topic">{topic}</Link>}
        <h1 className={post.title.length > 60 ? "article-title article-title-long" : "article-title"}>{post.title}</h1>
        {post.excerpt && <p className="article-standfirst">{post.excerpt}</p>}
        <p className="article-meta">
          {post.author && <span className="article-author">{post.author.url ? <a href={post.author.url} rel="author">{post.author.name}</a> : post.author.name}</span>}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt)}</time>
          <span>{readingTime(post.wordCount)}</span>
        </p>
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
                {post.tags.map((t) => <li key={t}><Link href={tagPath(t)}>{t}</Link></li>)}
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
          <PostList posts={related} />
        </section>
      )}

      {jsonLdFor(post).map((block, i) => (
        // JSON from VOX; "<" is escaped so a value can never close the script tag.
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, "\\u003c") }} />
      ))}
    </article>
  );
}
