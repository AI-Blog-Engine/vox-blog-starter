/** A plain GET form: works without JavaScript and keeps the query in the URL (/search?q=…). */
export function SearchForm({ defaultValue = "", large = false, prefix = "" }: { defaultValue?: string; large?: boolean; prefix?: string }) {
  return (
    <form action={`${prefix}/search`} role="search" className={large ? "search search-large" : "search"}>
      <label htmlFor={large ? "q-large" : "q"} className="visually-hidden">Search articles</label>
      <input id={large ? "q-large" : "q"} name="q" type="search" defaultValue={defaultValue} placeholder="Search articles" required minLength={2} maxLength={200} />
      <button type="submit">Search</button>
    </form>
  );
}
