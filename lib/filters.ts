// Filter model for the browse listings, shared by the FilterBar (client), the
// browse pages (server) and /api/movies. Deliberately free of server-only
// imports so all three can use the same parse/serialize pair — the URL is the
// single source of truth for filter state.
//
// Every value below was verified against the live TMDB API; the two discover
// endpoints do NOT share a vocabulary (movie sorts on primary_release_date and
// revenue, tv on first_air_date and `name` rather than `title`), which is why
// most option lists are keyed by media type.

import type { MediaType } from "./types";

export interface Filters {
  /** TMDB `sort_by`. Always set — the preset chips write this same field. */
  sort: string;
  /** TMDB genre id. */
  genre?: number;
  yearFrom?: number;
  yearTo?: number;
  minVotes?: number;
  /** TV only. */
  status?: number;
  type?: number;
  /** Movie only: US certification, e.g. "PG-13". */
  cert?: string;
}

export interface Option<T = string> {
  value: T;
  label: string;
}

export const DEFAULT_SORT = "popularity.desc";

/**
 * The preset chips. They write the same `sort` param the Sort select reads, so
 * the two controls can't contradict each other and there's no "nothing
 * selected" state. Trending is absent on purpose: /trending/{media}/week
 * accepts only `language`, and TMDB silently drops unknown query params — so a
 * filtered trending request looks like it worked while returning an unfiltered
 * feed. `popularity.desc` is the closest filterable equivalent.
 */
export const PRESETS: Option[] = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
];

export const SORT_OPTIONS: Record<MediaType, Option[]> = {
  movie: [
    { value: "popularity.desc", label: "Popular" },
    { value: "vote_average.desc", label: "Top Rated" },
    { value: "primary_release_date.desc", label: "Newest" },
    { value: "primary_release_date.asc", label: "Oldest" },
    { value: "vote_count.desc", label: "Most Voted" },
    { value: "revenue.desc", label: "Highest Grossing" },
    { value: "title.asc", label: "Title A–Z" },
  ],
  tv: [
    { value: "popularity.desc", label: "Popular" },
    { value: "vote_average.desc", label: "Top Rated" },
    { value: "first_air_date.desc", label: "Newest" },
    { value: "first_air_date.asc", label: "Oldest" },
    { value: "vote_count.desc", label: "Most Voted" },
    { value: "name.asc", label: "Title A–Z" },
  ],
};

export const MIN_VOTES_OPTIONS: Option<number>[] = [
  { value: 50, label: "50+" },
  { value: 100, label: "100+" },
  { value: 500, label: "500+" },
  { value: 1000, label: "1,000+" },
  { value: 5000, label: "5,000+" },
];

/** TMDB `with_status` codes. */
export const TV_STATUS_OPTIONS: Option<number>[] = [
  { value: 0, label: "Returning" },
  { value: 2, label: "In Production" },
  { value: 3, label: "Ended" },
  { value: 4, label: "Canceled" },
];

/** TMDB `with_type` codes. */
export const TV_TYPE_OPTIONS: Option<number>[] = [
  { value: 4, label: "Scripted" },
  { value: 2, label: "Miniseries" },
  { value: 0, label: "Documentary" },
  { value: 3, label: "Reality" },
  { value: 5, label: "Talk Show" },
  { value: 1, label: "News" },
];

/** /certification/movie/list -> US, in TMDB's own order. */
export const CERT_OPTIONS: Option[] = ["G", "PG", "PG-13", "R", "NC-17", "NR"].map((v) => ({
  value: v,
  label: v,
}));

const FIRST_YEAR = 1920;
const LAST_YEAR = new Date().getFullYear() + 5;

/** Descending, so the useful end of the range is at the top of the select. */
export const YEAR_OPTIONS: number[] = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, i) => LAST_YEAR - i
);

/**
 * `vote_average.desc` on its own surfaces obscure titles with a single 10/10
 * vote, so a rating sort always carries a minimum-vote floor. TV's is lower —
 * shows collect far fewer votes than films.
 */
const RATING_VOTE_FLOOR: Record<MediaType, number> = { movie: 300, tv: 100 };

type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>;

function read(src: ParamSource, key: string): string | undefined {
  if (src instanceof URLSearchParams) return src.get(key) ?? undefined;
  const value = src[key];
  return Array.isArray(value) ? value[0] : value;
}

function readInt(src: ParamSource, key: string): number | undefined {
  const raw = read(src, key);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isInteger(n) ? n : undefined;
}

/** Keeps an out-of-range or unknown value from reaching TMDB. */
function allowed<T>(options: Option<T>[], value: T | undefined): T | undefined {
  return value !== undefined && options.some((o) => o.value === value) ? value : undefined;
}

export function parseFilters(media: MediaType, src: ParamSource): Filters {
  const rawSort = read(src, "sort");
  const sort = allowed(SORT_OPTIONS[media], rawSort) ?? DEFAULT_SORT;

  // Genres come from TMDB at runtime, so there's no static list to check
  // against — a positive integer is as far as validation can go here.
  const genre = readInt(src, "genre");

  let yearFrom = readInt(src, "from");
  let yearTo = readInt(src, "to");
  if (yearFrom && !YEAR_OPTIONS.includes(yearFrom)) yearFrom = undefined;
  if (yearTo && !YEAR_OPTIONS.includes(yearTo)) yearTo = undefined;
  // An inverted range would always return zero results — read it as intent.
  if (yearFrom && yearTo && yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];

  const filters: Filters = {
    sort,
    genre: genre && genre > 0 ? genre : undefined,
    yearFrom,
    yearTo,
    minVotes: allowed(MIN_VOTES_OPTIONS, readInt(src, "votes")),
  };

  if (media === "tv") {
    filters.status = allowed(TV_STATUS_OPTIONS, readInt(src, "status"));
    filters.type = allowed(TV_TYPE_OPTIONS, readInt(src, "type"));
  } else {
    filters.cert = allowed(CERT_OPTIONS, read(src, "cert"));
  }

  return filters;
}

/** Filters -> app query string. Defaults are omitted so URLs stay readable. */
export function serializeFilters(media: MediaType, f: Filters): string {
  const sp = new URLSearchParams();
  if (f.sort !== DEFAULT_SORT) sp.set("sort", f.sort);
  if (f.genre) sp.set("genre", String(f.genre));
  if (f.yearFrom) sp.set("from", String(f.yearFrom));
  if (f.yearTo) sp.set("to", String(f.yearTo));
  if (f.minVotes) sp.set("votes", String(f.minVotes));
  if (media === "tv") {
    // `with_status: 0` (Returning) is a real value — don't drop it as falsy.
    if (f.status !== undefined) sp.set("status", String(f.status));
    if (f.type !== undefined) sp.set("type", String(f.type));
  } else if (f.cert) {
    sp.set("cert", f.cert);
  }
  return sp.toString();
}

/** Filters -> TMDB /discover query params. */
export function toDiscoverParams(media: MediaType, f: Filters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    sort_by: f.sort,
    include_adult: "false",
  };

  if (f.genre) params.with_genres = f.genre;

  const dateKey = media === "tv" ? "first_air_date" : "primary_release_date";
  if (f.yearFrom) params[`${dateKey}.gte`] = `${f.yearFrom}-01-01`;
  if (f.yearTo) params[`${dateKey}.lte`] = `${f.yearTo}-12-31`;

  const floor = f.sort.startsWith("vote_average") ? RATING_VOTE_FLOOR[media] : 0;
  const minVotes = Math.max(f.minVotes ?? 0, floor);
  if (minVotes) params["vote_count.gte"] = minVotes;

  if (media === "tv") {
    if (f.status !== undefined) params.with_status = f.status;
    if (f.type !== undefined) params.with_type = f.type;
  } else if (f.cert) {
    // `certification` is ignored unless a country accompanies it.
    params.certification_country = "US";
    params.certification = f.cert;
  }

  return params;
}

/** Count of applied filters excluding sort — drives the disclosure badge. */
export function activeFilterCount(f: Filters): number {
  return [
    f.genre !== undefined,
    f.yearFrom !== undefined,
    f.yearTo !== undefined,
    f.minVotes !== undefined,
    f.status !== undefined,
    f.type !== undefined,
    f.cert !== undefined,
  ].filter(Boolean).length;
}
