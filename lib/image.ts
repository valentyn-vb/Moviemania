// TMDB image URL builder. The base host + size tokens are stable, so we skip
// the old runtime `configuration` fetch entirely. HTTPS (the old app used
// http:// and relied on a CSP upgrade-insecure-requests hack).

const IMAGE_BASE = "https://image.tmdb.org/t/p/";

// Sizes preserved from the old app: posters used poster_sizes[3] = w342,
// profiles used profile_sizes[2] = h632 (height-constrained, not w185).
export const POSTER_SIZE = "w342";
export const PROFILE_SIZE = "h632";

// Backdrops only render at hero scale (full content-column width), so the
// second-largest size is the useful one — w1280 rather than `original`, which
// ships multi-megabyte source files.
export const BACKDROP_SIZE = "w1280";

export function tmdbImg(path: string, size: string = POSTER_SIZE): string {
  return `${IMAGE_BASE}${size}${path}`;
}
