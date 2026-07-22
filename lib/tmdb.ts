import "server-only";
import { cache } from "react";
import type { MovieDetails, MoviePage } from "./types";

const BASE_URL = "https://api.themoviedb.org/3";

const CATEGORY_PATHS = {
  // NOTE: trending uses /movie (not /all) — the old /trending/all/week returned
  // TV items that lack `title` and 404 on /movie/{id}.
  trending: "trending/movie/week",
  upcoming: "movie/upcoming",
  top_rated: "movie/top_rated",
} as const;

export type Category = keyof typeof CATEGORY_PATHS;

export function isCategory(value: string): value is Category {
  return value in CATEGORY_PATHS;
}

export const CATEGORIES = Object.keys(CATEGORY_PATHS) as Category[];

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set — add it to .env.local (see .env.example).");
  }
  return key;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
  revalidate: number | false = 3600
): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  // Next 16 does NOT cache fetch by default — opt in explicitly.
  const init: RequestInit =
    revalidate === false ? { cache: "no-store" } : { next: { revalidate } };

  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export function getMoviesByCategory(category: Category, page = 1): Promise<MoviePage> {
  return tmdbFetch<MoviePage>(CATEGORY_PATHS[category], { page }, 3600);
}

export function searchMovies(query: string, page = 1): Promise<MoviePage> {
  // Search is inherently dynamic — don't cache.
  return tmdbFetch<MoviePage>("search/movie", { query, page }, false);
}

// cache() dedups this across the details layout + page + cast + reviews within
// a single request, replacing react-router's <Outlet context>.
export const getMovieDetails = cache((movieId: string): Promise<MovieDetails> => {
  return tmdbFetch<MovieDetails>(
    `movie/${movieId}`,
    { append_to_response: "credits,reviews,videos" },
    3600
  );
});

export async function getWatchlistMovies(ids: number[]): Promise<MovieDetails[]> {
  const settled = await Promise.allSettled(ids.map((id) => getMovieDetails(String(id))));
  return settled
    .filter((r): r is PromiseFulfilledResult<MovieDetails> => r.status === "fulfilled")
    .map((r) => r.value);
}
