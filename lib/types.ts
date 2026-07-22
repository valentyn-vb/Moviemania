// Shared TMDB response shapes. Type-only, so safe to import from both
// server and client components.

export interface Movie {
  id: number;
  title?: string;
  name?: string; // present on TV items; we normalize to `title` at the edge
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  media_type?: string;
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

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
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
}
