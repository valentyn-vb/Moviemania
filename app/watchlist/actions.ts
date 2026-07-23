"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { watchedMovies } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getWatchlistMovies } from "@/lib/tmdb";
import type { MovieDetails } from "@/lib/types";

// Server Action: fetch details for the watchlisted ids server-side (keeps the
// TMDB key hidden). Replaces the old client-side per-id axios loop.
export async function fetchWatchlistMovies(ids: number[]): Promise<MovieDetails[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return getWatchlistMovies(ids);
}

/** Movie ids the current session's user has marked watched. Empty if no session. */
export async function getWatchedIds(): Promise<number[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await db
    .select({ movieId: watchedMovies.movieId })
    .from(watchedMovies)
    .where(eq(watchedMovies.userId, session.userId));
  return rows.map((row) => row.movieId);
}

/**
 * Flips watched status for movieId under the current session's user, and
 * returns the resulting state so the caller can reconcile an optimistic
 * update without a second round-trip.
 *
 * This is reachable as a direct Server Action call regardless of which page
 * invoked it, so it re-checks the session itself even though
 * app/watchlist/layout.tsx already gates the UI that normally calls it.
 */
export async function toggleWatched(movieId: number): Promise<{ watched: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const { userId } = session;

  const [inserted] = await db
    .insert(watchedMovies)
    .values({ userId, movieId })
    .onConflictDoNothing()
    .returning({ id: watchedMovies.id });

  if (inserted) return { watched: true };

  await db
    .delete(watchedMovies)
    .where(and(eq(watchedMovies.userId, userId), eq(watchedMovies.movieId, movieId)));
  return { watched: false };
}
