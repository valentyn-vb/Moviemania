"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { watchedMovies, favoriteMovies, watchlistMovies } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { getTitlesByRef } from "@/lib/tmdb";
import type { MediaType, MovieDetails, WatchlistItem } from "@/lib/types";

// Server Action: fetch details for the given refs server-side (keeps the TMDB
// key hidden). Handles both movies and tv shows.
export async function fetchWatchlistMovies(refs: WatchlistItem[]): Promise<MovieDetails[]> {
  if (!Array.isArray(refs) || refs.length === 0) return [];
  return getTitlesByRef(refs);
}

/** Refs the current session's user has marked watched. Empty if no session. */
export async function getWatched(): Promise<WatchlistItem[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await db
    .select({ movieId: watchedMovies.movieId, mediaType: watchedMovies.mediaType })
    .from(watchedMovies)
    .where(eq(watchedMovies.userId, session.userId));
  return rows.map((row) => ({ id: row.movieId, mediaType: row.mediaType as MediaType }));
}

/**
 * Flips watched status for a title under the current session's user, and
 * returns the resulting state so the caller can reconcile an optimistic
 * update without a second round-trip.
 *
 * This is reachable as a direct Server Action call regardless of which page
 * invoked it, so it re-checks the session itself even though
 * app/watchlist/layout.tsx already gates the UI that normally calls it.
 */
export async function toggleWatched(
  movieId: number,
  mediaType: MediaType
): Promise<{ watched: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const { userId } = session;

  const [inserted] = await db
    .insert(watchedMovies)
    .values({ userId, movieId, mediaType })
    .onConflictDoNothing()
    .returning({ id: watchedMovies.id });

  if (inserted) return { watched: true };

  await db
    .delete(watchedMovies)
    .where(
      and(
        eq(watchedMovies.userId, userId),
        eq(watchedMovies.movieId, movieId),
        eq(watchedMovies.mediaType, mediaType)
      )
    );
  return { watched: false };
}

/** Refs the current session's user has marked favorite. Empty if no session. */
export async function getFavorites(): Promise<WatchlistItem[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await db
    .select({ movieId: favoriteMovies.movieId, mediaType: favoriteMovies.mediaType })
    .from(favoriteMovies)
    .where(eq(favoriteMovies.userId, session.userId));
  return rows.map((row) => ({ id: row.movieId, mediaType: row.mediaType as MediaType }));
}

/**
 * Flips favorite status for a title under the current session's user, and
 * returns the resulting state so the caller can reconcile an optimistic
 * update without a second round-trip. Mirrors toggleWatched.
 */
export async function toggleFavorite(
  movieId: number,
  mediaType: MediaType
): Promise<{ favorite: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const { userId } = session;

  const [inserted] = await db
    .insert(favoriteMovies)
    .values({ userId, movieId, mediaType })
    .onConflictDoNothing()
    .returning({ id: favoriteMovies.id });

  if (inserted) return { favorite: true };

  await db
    .delete(favoriteMovies)
    .where(
      and(
        eq(favoriteMovies.userId, userId),
        eq(favoriteMovies.movieId, movieId),
        eq(favoriteMovies.mediaType, mediaType)
      )
    );
  return { favorite: false };
}

/** Refs on the current session's user's watch list. Empty if no session. */
export async function getWatchlist(): Promise<WatchlistItem[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await db
    .select({ movieId: watchlistMovies.movieId, mediaType: watchlistMovies.mediaType })
    .from(watchlistMovies)
    .where(eq(watchlistMovies.userId, session.userId));
  return rows.map((row) => ({ id: row.movieId, mediaType: row.mediaType as MediaType }));
}

/**
 * Flips watch-list membership for a title under the current session's user, and
 * returns the resulting state so the caller can reconcile an optimistic update
 * without a second round-trip. Mirrors toggleWatched.
 */
export async function toggleWatchlist(
  movieId: number,
  mediaType: MediaType
): Promise<{ watchlisted: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const { userId } = session;

  const [inserted] = await db
    .insert(watchlistMovies)
    .values({ userId, movieId, mediaType })
    .onConflictDoNothing()
    .returning({ id: watchlistMovies.id });

  if (inserted) return { watchlisted: true };

  await db
    .delete(watchlistMovies)
    .where(
      and(
        eq(watchlistMovies.userId, userId),
        eq(watchlistMovies.movieId, movieId),
        eq(watchlistMovies.mediaType, mediaType)
      )
    );
  return { watchlisted: false };
}

/**
 * Whether the current user is signed in and whether they've watch-listed /
 * marked this title watched / favorite. Used to seed the details-page action
 * toggles. Returns all false when there's no session (all three are
 * account-only features).
 */
export async function getMovieStatus(
  movieId: number,
  mediaType: MediaType
): Promise<{ authed: boolean; watchlisted: boolean; watched: boolean; favorite: boolean }> {
  const session = await getSession();
  if (!session) return { authed: false, watchlisted: false, watched: false, favorite: false };
  const { userId } = session;

  const [watchlisted] = await db
    .select({ id: watchlistMovies.id })
    .from(watchlistMovies)
    .where(
      and(
        eq(watchlistMovies.userId, userId),
        eq(watchlistMovies.movieId, movieId),
        eq(watchlistMovies.mediaType, mediaType)
      )
    )
    .limit(1);

  const [watched] = await db
    .select({ id: watchedMovies.id })
    .from(watchedMovies)
    .where(
      and(
        eq(watchedMovies.userId, userId),
        eq(watchedMovies.movieId, movieId),
        eq(watchedMovies.mediaType, mediaType)
      )
    )
    .limit(1);
  const [favorite] = await db
    .select({ id: favoriteMovies.id })
    .from(favoriteMovies)
    .where(
      and(
        eq(favoriteMovies.userId, userId),
        eq(favoriteMovies.movieId, movieId),
        eq(favoriteMovies.mediaType, mediaType)
      )
    )
    .limit(1);

  return {
    authed: true,
    watchlisted: Boolean(watchlisted),
    watched: Boolean(watched),
    favorite: Boolean(favorite),
  };
}
