import { VoxSetupError } from "./vox";

export type Loaded<T> = { ok: true; data: T } | { ok: false; setup: string };

/** Runs a VOX call; a missing or refused key becomes `{ ok: false, setup }` so the page can show setup steps. */
export async function load<T>(fn: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err instanceof VoxSetupError) return { ok: false, setup: err.message };
    throw err;
  }
}

/** A positive page number from ?page=, defaulting to 1. */
export const pageParam = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
};
