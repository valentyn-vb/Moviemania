"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import MovieActions from "@/components/MovieActions";
import Loader from "@/components/Loader";
import { getWatchlistIds, useWatchlist } from "@/lib/watchlist";
import { fetchWatchlistMovies, getWatchedIds, getFavoriteIds } from "@/app/watchlist/actions";
import type { MovieDetails } from "@/lib/types";

export type CollectionKind = "watchlist" | "watched" | "favorites";

const EMPTY_MESSAGE: Record<CollectionKind, string> = {
  watchlist: "No movies have been added to your watch list yet",
  watched: "No movies marked as watched yet",
  favorites: "No favorite movies yet",
};

export default function CollectionList({ kind }: { kind: CollectionKind }) {
  const [movies, setMovies] = useState<MovieDetails[] | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  // Watchlist lives in localStorage; the shared store keeps this reactive so a
  // movie removed from the watch list disappears from the list immediately.
  const watchlistIds = useWatchlist();

  useEffect(() => {
    let cancelled = false;
    // Read watchlist ids after mount (localStorage is client-only), then fetch
    // the account's watched + favorite ids. We load all three id sets so each
    // card's toggles show the right state, but only hydrate details for the
    // list this route displays.
    const listIds = getWatchlistIds();
    Promise.all([getWatchedIds(), getFavoriteIds()])
      .then(async ([watched, favorites]) => {
        const displayIds =
          kind === "watchlist" ? listIds : kind === "watched" ? watched : favorites;
        const movieResults = await fetchWatchlistMovies(displayIds);
        if (cancelled) return;
        setMovies(movieResults);
        setWatchedIds(new Set(watched));
        setFavoriteIds(new Set(favorites));
      })
      .catch(() => {
        if (!cancelled) setError("Whoops, something went wrong loading your collection.");
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  function markMembership(
    setter: React.Dispatch<React.SetStateAction<Set<number>>>,
    id: number,
    member: boolean
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (member) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  if (error) return <p className="p-4 text-light">{error}</p>;
  if (movies === null) return <Loader />;

  const membership =
    kind === "watchlist"
      ? new Set(watchlistIds)
      : kind === "watched"
        ? watchedIds
        : favoriteIds;
  const activeList = movies.filter((movie) => membership.has(movie.id));

  if (activeList.length === 0) {
    return <p className="p-4 font-normal text-light">{EMPTY_MESSAGE[kind]}</p>;
  }

  return (
    <ul className="mt-8 flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:justify-center">
      {activeList.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          action={
            <MovieActions
              movieId={movie.id}
              authed
              variant="card"
              initialWatched={watchedIds.has(movie.id)}
              initialFavorite={favoriteIds.has(movie.id)}
              onWatchedChange={(member) => markMembership(setWatchedIds, movie.id, member)}
              onFavoriteChange={(member) => markMembership(setFavoriteIds, movie.id, member)}
            />
          }
        />
      ))}
    </ul>
  );
}
