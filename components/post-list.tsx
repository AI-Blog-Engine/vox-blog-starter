import Link from "next/link";

import { formatDate, readingTime } from "@/lib/format";
import type { Locale } from "@/lib/i18n";
import { categoryPath, postHref } from "@/lib/site";
import type { Post } from "@/lib/vox";

/** The article index: one row per post, title first, so a long list stays easy to scan. */
export function PostList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  return (
    <ol className="postlist" role="list">
      {posts.map((p) => (
        <li key={p.id} className="postrow">
          <div className="postrow-meta">
            <time dateTime={p.publishedAt ?? undefined}>{formatDate(p.publishedAt)}</time>
            <span>{readingTime(p.wordCount)}</span>
          </div>
          <div className="postrow-body">
            {p.categories[0] && <Link href={categoryPath(p.categories[0], locale.prefix)} className="postrow-topic">{p.categories[0]}</Link>}
            <h2 className="postrow-title"><Link href={postHref(p, locale)}>{p.title}</Link></h2>
            {p.excerpt && <p className="postrow-excerpt">{p.excerpt}</p>}
          </div>
          {p.coverImageUrl && (
            <Link href={postHref(p, locale)} className="postrow-cover" tabIndex={-1} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- covers come from any host; no image proxy needed */}
              <img src={p.coverImageUrl} alt="" loading="lazy" width={240} height={160} />
            </Link>
          )}
        </li>
      ))}
    </ol>
  );
}
