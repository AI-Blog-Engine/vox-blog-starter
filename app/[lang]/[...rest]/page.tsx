import { notFound } from "next/navigation";

/** Any other URL under /<something>/: a 404 rendered inside the site's layout. */
export default function CatchAll(): never {
  notFound();
}
