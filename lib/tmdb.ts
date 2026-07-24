import "server-only";
import { cache } from "react";
import type { MediaType, Movie, MovieDetails, MoviePage, WatchlistItem } from "./types";

const BASE_URL = "https://api.themoviedb.org/3";

// Category feeds per media type. Movies keep trending/upcoming/top_rated; TV
// gets its own reasonable set (there's no "upcoming" TV feed). Trending uses the
// media-specific /movie or /tv path — the old /trending/all/week mixed both and
// returned items missing title/name.
const CATEGORY_PATHS = {
  movie: {
    trending: "trending/movie/week",
    upcoming: "movie/upcoming",
    top_rated: "movie/top_rated",
  },
  tv: {
    trending: "trending/tv/week",
    popular: "tv/popular",
    top_rated: "tv/top_rated",
  },
} as const;

export function isMediaType(value: string): value is MediaType {
  return value === "movie" || value === "tv";
}

export function isCategory(media: MediaType, value: string): boolean {
  return value in CATEGORY_PATHS[media];
}

/** Ordered category keys for a media type (drives the browse tabs). */
export function getCategories(media: MediaType): string[] {
  return Object.keys(CATEGORY_PATHS[media]);
}

/** All (mediaType, category) pairs — used by generateStaticParams. */
export function getMediaCategoryParams(): { mediaType: MediaType; category: string }[] {
  return (Object.keys(CATEGORY_PATHS) as MediaType[]).flatMap((mediaType) =>
    getCategories(mediaType).map((category) => ({ mediaType, category }))
  );
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
  return { ...page, results: page.results.map((item) => normalizeListItem(item, media)) };
}

export async function getListing(
  media: MediaType,
  category: string,
  page = 1
): Promise<MoviePage> {
  const paths = CATEGORY_PATHS[media] as Record<string, string>;
  const data = await tmdbFetch<MoviePage>(paths[category], { page }, 3600);
  return normalizePage(data, media);
}

export async function searchTitles(
  media: MediaType,
  query: string,
  page = 1
): Promise<MoviePage> {
  // Search is inherently dynamic — don't cache.
  const data = await tmdbFetch<MoviePage>(`search/${media}`, { query, page }, false);
  return normalizePage(data, media);
}

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
