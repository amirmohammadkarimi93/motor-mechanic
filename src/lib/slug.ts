// Slug helpers - Persian-safe slug generation
// Keeps Persian characters, English letters, numbers, and dashes.

/**
 * Convert a string to a URL-safe slug.
 * Persian characters are preserved (URL-encoded when used in URLs).
 * Spaces become dashes, other non-permitted chars are stripped.
 */
export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .replace(/\s+/g, "-") // spaces (any whitespace) to dashes
    .replace(/[^\u0600-\u06FF\u0750-\u077F\w-]+/g, "") // keep persian, word chars, dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
    .toLowerCase();
}

/**
 * Generate a unique slug by appending a counter if the base slug already exists.
 * Tries `base`, then `base-2`, `base-3`, etc.
 *
 * @param base - The desired slug (already slugified)
 * @param exists - Async function that returns true if the slug is already in use
 */
export async function uniqueSlug(
  base: string,
  exists: (s: string) => Promise<boolean>
): Promise<string> {
  const cleaned = base || "item";
  if (!(await exists(cleaned))) return cleaned;
  let counter = 2;
  while (true) {
    const candidate = `${cleaned}-${counter}`;
    if (!(await exists(candidate))) return candidate;
    counter++;
    if (counter > 100000) {
      // Safety valve to prevent infinite loops
      return `${cleaned}-${Date.now()}`;
    }
  }
}
