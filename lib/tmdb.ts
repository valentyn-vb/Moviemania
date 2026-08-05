import "server-only";
import { cache } from "react";
import { toDiscoverParams, type Filters } from "./filters";
import type {
  Genre,
  MediaType,
  Movie,
  MovieDetails,
  MoviePage,
  PersonCredit,
  PersonDetails,
  PersonSummary,
  WatchlistItem,
} from "./types";

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

export type TrendingWindow = "day" | "week";

/**
 * The home page's curated feeds. These are the endpoints lib/filters.ts rules
 * out for the browse listings — /trending accepts only `language` and the
 * /movie/* lists accept only `page` and `region`, so neither can carry a sort
 * or a genre. The home page applies no filters, so that objection doesn't
 * apply here and the hand-curated ordering is exactly what's wanted.
 */
export const getTrending = cache(
  async (media: MediaType, timeWindow: TrendingWindow): Promise<Movie[]> => {
    const data = await tmdbFetch<MoviePage>(`trending/${media}/${timeWindow}`, {}, 3600);
    return normalizePage(data, media).results;
  }
);

export type MovieListName = "popular" | "top_rated" | "upcoming" | "now_playing";

export const getMovieList = cache(async (list: MovieListName): Promise<Movie[]> => {
  // now_playing and upcoming also return a `dates` window we don't render.
  const data = await tmdbFetch<MoviePage>(`movie/${list}`, {}, 3600);
  return normalizePage(data, "movie").results;
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

// A combined_credits row. TMDB stamps a real media_type on each one (unlike
// list endpoints), and carries the role under `character` or `job` depending on
// which of the two arrays it came from.
interface RawCredit extends Movie {
  character?: string;
  job?: string;
  vote_count?: number;
}

interface RawPerson {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string | null;
  profile_path: string | null;
  combined_credits: { cast: RawCredit[]; crew: RawCredit[] };
}

/**
 * Flattens cast + crew into one filmography.
 *
 * Sorted by vote_count, NOT popularity. TMDB's `popularity` is a recency and
 * traffic metric, so sorting by it buries the work someone is actually known
 * for under talk-show drop-ins — Bryan Cranston's top credits come back as
 * Colbert, Fallon and Seth Meyers rather than Breaking Bad.
 *
 * Deduped because the same title recurs under several credit_ids (54 repeats
 * across Spielberg's crew list alone).
 */
function normalizeCredits(raw: RawPerson["combined_credits"]): PersonCredit[] {
  const byTitle = new Map<string, PersonCredit>();

  // Cast first, so an acting role wins over a crew job on a title where the
  // person did both.
  for (const item of [...raw.cast, ...raw.crew]) {
    const media: MediaType = item.media_type ?? "movie";
    const key = `${media}:${item.id}`;
    if (byTitle.has(key)) continue;
    byTitle.set(key, {
      ...item,
      title: item.title ?? item.name,
      media_type: media,
      role: item.character || item.job || "",
    });
  }

  return [...byTitle.values()].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
}

// cache()-wrapped so generateMetadata and the page body share one request, the
// same way getTitleDetails is shared across the detail layout and its tabs.
export const getPerson = cache(async (id: string): Promise<PersonDetails> => {
  const raw = await tmdbFetch<RawPerson>(
    `person/${id}`,
    { append_to_response: "combined_credits" },
    3600
  );
  return {
    id: raw.id,
    name: raw.name,
    biography: raw.biography ?? "",
    birthday: raw.birthday,
    deathday: raw.deathday,
    place_of_birth: raw.place_of_birth,
    known_for_department: raw.known_for_department ?? "",
    profile_path: raw.profile_path,
    credits: normalizeCredits(raw.combined_credits),
  };
});

export async function getTitlesByRef(refs: WatchlistItem[]): Promise<MovieDetails[]> {
  const settled = await Promise.allSettled(
    refs.map((ref) => getTitleDetails(ref.mediaType, String(ref.id)))
  );
  return settled
    .filter((r): r is PromiseFulfilledResult<MovieDetails> => r.status === "fulfilled")
    .map((r) => r.value);
}

// How many trending films to mine for faces, and how deep into each one's
// billing to look. Past the top ten a cast list is bit parts and voice cameos.
const PEOPLE_SOURCE_TITLES = 8;
const PEOPLE_BILLING_DEPTH = 10;

interface CastTally {
  person: PersonSummary;
  /** Films in the sample they appear in — the primary ranking signal. */
  films: number;
  /** Best (lowest) billing position reached across those films. */
  billing: number;
  /** Position of that film in the trending list, as the final tiebreak. */
  rank: number;
}

/**
 * The faces behind this week's trending films.
 *
 * Derived rather than fetched because TMDB has no usable "popular people"
 * feed: /person/popular and /trending/person both rank on raw `popularity`,
 * which puts obscure and adult-film names above the likes of Tom Holland, and
 * `include_adult=false` does not filter them — TMDB silently drops unknown
 * query params (verified: the response is byte-identical with and without it,
 * and a nonsense param still returns 200; same trap as the trending note in
 * lib/filters.ts). /trending/person doesn't even return `known_for`.
 *
 * Aggregating the billed cast of the trending titles costs no extra requests:
 * getTitleDetails already appends credits and is cache()-wrapped, so the
 * hero's fetch of the top trending film is deduped against this one.
 */
export async function getTrendingPeople(limit = 14): Promise<PersonSummary[]> {
  const trending = await getTrending("movie", "week");
  const details = await getTitlesByRef(
    trending.slice(0, PEOPLE_SOURCE_TITLES).map((movie) => ({
      id: movie.id,
      mediaType: "movie" as const,
    }))
  );

  const tallies = new Map<number, CastTally>();

  details.forEach((title, rank) => {
    // TMDB returns cast in billing order, so the array index is the position.
    title.credits.cast.slice(0, PEOPLE_BILLING_DEPTH).forEach((actor, billing) => {
      if (!actor.profile_path) return;

      const seen = tallies.get(actor.id);
      if (!seen) {
        tallies.set(actor.id, {
          person: {
            id: actor.id,
            name: actor.name,
            profile_path: actor.profile_path,
            knownFor: title.title,
          },
          films: 1,
          billing,
          rank,
        });
        return;
      }

      // Caption them with whichever of the trending films they lead, not
      // whichever happens to come first in the feed.
      seen.films += 1;
      if (billing < seen.billing) {
        seen.billing = billing;
        seen.rank = rank;
        seen.person.knownFor = title.title;
      }
    });
  });

  return [...tallies.values()]
    .sort((a, b) => b.films - a.films || a.billing - b.billing || a.rank - b.rank)
    .slice(0, limit)
    .map((tally) => tally.person);
}
