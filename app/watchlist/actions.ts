"use server";

import { getWatchlistMovies } from "@/lib/tmdb";
import type { MovieDetails } from "@/lib/types";

// Server Action: fetch details for the watchlisted ids server-side (keeps the
// TMDB key hidden). Replaces the old client-side per-id axios loop.
export async function fetchWatchlistMovies(ids: number[]): Promise<MovieDetails[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return getWatchlistMovies(ids);
}
