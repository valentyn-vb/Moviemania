"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import MovieActions from "@/components/MovieActions";
import Loader from "@/components/Loader";
import { getWatchlistItems, useWatchlist } from "@/lib/watchlist";
import { fetchWatchlistMovies, getWatched, getFavorites } from "@/app/watchlist/actions";
import type { MediaType, MovieDetails } from "@/lib/types";

export type CollectionKind = "watchlist" | "watched" | "favorites";

const EMPTY_MESSAGE: Record<CollectionKind, string> = {
  watchlist: "Nothing has been added to your watch list yet",
  watched: "Nothing marked as watched yet",
  favorites: "No favorites yet",
};

// Movie and tv ids are not unique across media, so collections key on the pair.
function keyOf(mediaType: MediaType, id: number): string {
  return `${mediaType}:${id}`;
}

export default function CollectionList({ kind }: { kind: CollectionKind }) {
  const [movies, setMovies] = useState<MovieDetails[] | null>(null);
  const [watchedKeys, setWatchedKeys] = useState<Set<string>>(new Set());
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  // Watchlist lives in localStorage; the shared store keeps this reactive so a
  // title removed from the watch list disappears from the list immediately.
  const watchlistItems = useWatchlist();

  useEffect(() => {
    let cancelled = false;
    // Read watchlist items after mount (localStorage is client-only), then fetch
    // the account's watched + favorite refs. We load all three sets so each
    // card's toggles show the right state, but only hydrate details for the
    // list this route displays.
    const listItems = getWatchlistItems();
    Promise.all([getWatched(), getFavorites()])
      .then(async ([watched, favorites]) => {
        const displayRefs =
          kind === "watchlist" ? listItems : kind === "watched" ? watched : favorites;
        const results = await fetchWatchlistMovies(displayRefs);
        if (cancelled) return;
        setMovies(results);
        setWatchedKeys(new Set(watched.map((r) => keyOf(r.mediaType, r.id))));
        setFavoriteKeys(new Set(favorites.map((r) => keyOf(r.mediaType, r.id))));
      })
      .catch(() => {
        if (!cancelled) setError("Whoops, something went wrong loading your collection.");
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  function markMembership(
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    key: string,
    member: boolean
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (member) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  if (error) return <p className="p-4 text-light">{error}</p>;
  if (movies === null) return <Loader />;

  const membership =
    kind === "watchlist"
      ? new Set(watchlistItems.map((it) => keyOf(it.mediaType, it.id)))
      : kind === "watched"
        ? watchedKeys
        : favoriteKeys;
  const activeList = movies.filter((movie) => membership.has(keyOf(movie.media_type, movie.id)));

  if (activeList.length === 0) {
    return <p className="p-4 font-normal text-light">{EMPTY_MESSAGE[kind]}</p>;
  }

  return (
    <ul className="mt-8 flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:justify-center">
      {activeList.map((movie) => {
        const key = keyOf(movie.media_type, movie.id);
        return (
          <MovieCard
            key={key}
            movie={movie}
            action={
              <MovieActions
                movieId={movie.id}
                mediaType={movie.media_type}
                authed
                variant="card"
                initialWatched={watchedKeys.has(key)}
                initialFavorite={favoriteKeys.has(key)}
                onWatchedChange={(member) => markMembership(setWatchedKeys, key, member)}
                onFavoriteChange={(member) => markMembership(setFavoriteKeys, key, member)}
              />
            }
          />
        );
      })}
    </ul>
  );
}
