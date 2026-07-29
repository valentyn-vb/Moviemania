import "server-only";
import { cache } from "react";
import { toDiscoverParams, type Filters } from "./filters";
import type { Genre, MediaType, Movie, MovieDetails, MoviePage, WatchlistItem } from "./types";

const BASE_URL = "https://api.themoviedb.org/3";

// TMDB refuses pages past 500 on every paginated endpoint, but still reports a
// far larger total_pages (10,000 for popular). Clamping here keeps infinite
// scroll from walking off the end into a 400.
const MAX_PAGE = 500;

export function isMediaType(value: string): value is MediaType {
  return value === "movie" || value === "tv";
}

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

// TV list/detail payloads expose `name`/`first_air_date` and never carry a
// media_type on list items — stamp both so downstream (cards, links) don't have
// to know which feed a result came from.
function normalizeListItem(item: Movie, media: MediaType): Movie {
  return { ...item, title: item.title ?? item.name, media_type: media };
}

function normalizePage(page: MoviePage, media: MediaType): MoviePage {
  return {
    ...page,
    total_pages: Math.min(page.total_pages, MAX_PAGE),
    results: page.results.map((item) => normalizeListItem(item, media)),
  };
}

/**
 * The browse listing. Every category the UI offers is expressed as /discover
 * params (see lib/filters.ts) rather than a curated feed like /movie/top_rated,
 * because the curated endpoints accept no filter params at all — so this is the
 * only way sort and filters compose.
 */
export async function discoverTitles(
  media: MediaType,
  filters: Filters,
  page = 1
): Promise<MoviePage> {
  const data = await tmdbFetch<MoviePage>(
    `discover/${media}`,
    { ...toDiscoverParams(media, filters), page: Math.min(Math.max(page, 1), MAX_PAGE) },
    3600
  );
  return normalizePage(data, media);
}

/**
 * Genre ids and names differ between movie and tv (TV has "Sci-Fi & Fantasy"
 * 10765 where movies have "Science Fiction" 878), so the lists are fetched
 * rather than hardcoded. Cached a day — they effectively never change.
 */
export const getGenres = cache(async (media: MediaType): Promise<Genre[]> => {
  const data = await tmdbFetch<{ genres: Genre[] }>(`genre/${media}/list`, {}, 86400);
  return data.genres;
});

export async function searchTitles(
  media: MediaType,
  query: string,
  page = 1
): Promise<MoviePage> {
  // Search is inherently dynamic — don't cache.
  const data = await tmdbFetch<MoviePage>(`search/${media}`, { query, page }, false);
  return normalizePage(data, media);
}

/**
 * TMDB's own related-titles list, for the "More Like This" row.
 *
 * The sibling `similar` endpoint is deliberately unused: it's genre-bucket
 * matching, not recommendations — /movie/1064215/similar reports 143,158
 * results and puts "Herbie Rides Again" at the top for a Turkish animation.
 *
 * Kept off MovieDetails on purpose. Appending it to getTitleDetails would save
 * a request, but MovieDetails is serialized to the client by
 * fetchWatchlistMovies, so every collection entry would drag 20 unread movie
 * objects across the wire.
 */
export const getRecommendations = cache(
  async (media: MediaType, id: string): Promise<Movie[]> => {
    // Same MoviePage shape as the discover/search feeds, so normalizePage
    // applies unchanged — which is what stamps media_type onto TV results.
    const data = await tmdbFetch<MoviePage>(`${media}/${id}/recommendations`, {}, 3600);
    return normalizePage(data, media).results;
  }
);

// Raw TMDB detail payload — movie and tv fields overlap but differ enough that
// we normalize to MovieDetails before it leaves this module.
interface RawDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  genres: MovieDetails["genres"];
  release_date?: string;
  first_air_date?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  imdb_id?: string | null;
  external_ids?: { imdb_id?: string | null };
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  credits: MovieDetails["credits"];
  reviews: MovieDetails["reviews"];
  videos: MovieDetails["videos"];
}

function normalizeDetails(raw: RawDetails, media: MediaType): MovieDetails {
  return {
    id: raw.id,
    title: raw.title ?? raw.name ?? "Untitled",
    overview: raw.overview,
    genres: raw.genres,
    release_date: raw.release_date ?? raw.first_air_date ?? "",
    runtime: media === "tv" ? raw.episode_run_time?.[0] ?? null : raw.runtime ?? null,
    imdb_id: media === "tv" ? raw.external_ids?.imdb_id ?? null : raw.imdb_id ?? null,
    vote_average: raw.vote_average,
    poster_path: raw.poster_path,
    backdrop_path: raw.backdrop_path,
    credits: raw.credits,
    reviews: raw.reviews,
    videos: raw.videos,
    media_type: media,
  };
}

// cache() dedups this across the details layout + page + cast + reviews within
// a single request, replacing react-router's <Outlet context>.
export const getTitleDetails = cache(
  (media: MediaType, id: string): Promise<MovieDetails> => {
    // TV exposes imdb_id via external_ids rather than a top-level field.
    const append =
      media === "tv" ? "credits,reviews,videos,external_ids" : "credits,reviews,videos";
    return tmdbFetch<RawDetails>(`${media}/${id}`, { append_to_response: append }, 3600).then(
      (raw) => normalizeDetails(raw, media)
    );
  }
);

export async function getTitlesByRef(refs: WatchlistItem[]): Promise<MovieDetails[]> {
  const settled = await Promise.allSettled(
    refs.map((ref) => getTitleDetails(ref.mediaType, String(ref.id)))
  );
  return settled
    .filter((r): r is PromiseFulfilledResult<MovieDetails> => r.status === "fulfilled")
    .map((r) => r.value);
}
