/** Pure helpers for administrator moderation (no server imports). */
const IMAGE_PATH = /\/api\/public\/images\/([0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp|gif|avif))/gi;

/** Finds uploaded-photo storage paths referenced anywhere inside a record. */
export function extractImagePaths(value: unknown): string[] {
  const text = JSON.stringify(value ?? '');
  return [...new Set([...text.matchAll(IMAGE_PATH)].map((m) => m[1]!))];
}

/** Case-insensitive match against any of the given fields. */
export function matchesQuery(query: string, ...fields: (string | null | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => (f ?? '').toLowerCase().includes(q));
}
