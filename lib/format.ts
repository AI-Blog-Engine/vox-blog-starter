const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export const formatDate = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : "");

/** Reading time at about 230 words a minute, never less than one minute. */
export const readingTime = (words: number | null) => `${Math.max(1, Math.round((words ?? 0) / 230))} min read`;

/** Shown in the API's casing, but compared case-insensitively. */
export const sameName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;
