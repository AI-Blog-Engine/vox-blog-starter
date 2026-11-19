import Link from "next/link";

/** Previous / next with the current position. `href(n)` builds the link for page n. */
export function Pagination({ page, perPage, total, href }: { page: number; perPage: number; total: number; href: (n: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pages" className="pagination">
      {page > 1 ? <Link href={href(page - 1)} rel="prev">Newer articles</Link> : <span aria-hidden="true" />}
      <span className="pagination-pos">Page {page} of {pages}</span>
      {page < pages ? <Link href={href(page + 1)} rel="next">Older articles</Link> : <span aria-hidden="true" />}
    </nav>
  );
}
