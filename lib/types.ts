// Shared TMDB response shapes. Type-only, so safe to import from both
// server and client components.

// The two kinds of title Moviemania browses. Threaded from the TMDB fetch edge
// through routing, cards, and the watchlist/collection persistence so a movie
// and a TV show (whose TMDB ids are NOT globally unique) never get confused.
export type MediaType = "movie" | "tv";

export interface Movie {
  id: number;
  title?: string;
  name?: string; // present on TV items; we normalize to `title` at the edge
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  media_type?: MediaType;
}

/** A movie/tv reference as stored in the watchlist and DB collections. */
export interface WatchlistItem {
  id: number;
  mediaType: MediaType;
}

export interface MoviePage {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

/** One combined_credits entry: a browsable title plus what the person did on it. */
export interface PersonCredit extends Movie {
  /** `character` for a cast credit, `job` for a crew one. "" when TMDB has neither. */
  role: string;
  /** Not rendered — this is what the filmography is ordered by. */
  vote_count?: number;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
  profile_path: string | null;
  /** Deduped and sorted by vote count — see getPerson. */
  credits: PersonCredit[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

/** One face in the home page's people row — see getTrendingPeople. */
export interface PersonSummary {
  id: number;
  name: string;
  /** Never null here: the row only keeps people TMDB has a photo for. */
  profile_path: string;
  /** The trending title they're billed highest in, used as the caption. */
  knownFor: string;
}

export interface CrewMember {
  id: number;
  name: string;
  known_for_department: string;
  job: string;
  department: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

// Normalized detail shape. TV payloads are mapped into this at the fetch edge
// (name -> title, first_air_date -> release_date, episode_run_time -> runtime,
// external_ids.imdb_id -> imdb_id) so the detail UI is media-agnostic.
export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  genres: Genre[];
  release_date: string;
  runtime: number | null;
  imdb_id: string | null;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  credits: { cast: CastMember[]; crew: CrewMember[] };
  reviews: { results: Review[] };
  videos: { results: Video[] };
  media_type: MediaType;
}
