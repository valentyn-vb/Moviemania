"use client";

import { useEffect, useState, useTransition } from "react";
import MovieCard from "@/components/MovieCard";
import WatchedButton from "@/components/WatchedButton";
import Loader from "@/components/Loader";
import { getWatchlistIds } from "@/lib/watchlist";
import { fetchWatchlistMovies, getWatchedIds, toggleWatched } from "./actions";
import type { MovieDetails } from "@/lib/types";

const tabClass =
  "mr-4 cursor-pointer border-none bg-page text-l font-normal transition-colors duration-300 hover:text-accent";
const tabInactive = "text-muted";
const tabActive = "text-accent";

type Tab = "watchlist" | "watched";

export default function WatchlistPage() {
  const [movies, setMovies] = useState<MovieDetails[] | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("watchlist");
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    // Read the watchlist ids after mount (localStorage is client-only), then
    // fetch movie details and the account's watched ids in parallel.
    Promise.all([fetchWatchlistMovies(getWatchlistIds()), getWatchedIds()])
      .then(([movieResults, watched]) => {
        if (cancelled) return;
        setMovies(movieResults);
        setWatchedIds(new Set(watched));
      })
      .catch(() => {
        if (!cancelled) setError("Whoops, something went wrong loading your watchlist.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleToggle(movieId: number) {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });

    startTransition(async () => {
      try {
        const { watched } = await toggleWatched(movieId);
        setWatchedIds((prev) => {
          const next = new Set(prev);
          if (watched) next.add(movieId);
          else next.delete(movieId);
          return next;
        });
      } catch {
        // Revert the optimistic flip if the server call failed.
        setWatchedIds((prev) => {
          const next = new Set(prev);
          if (next.has(movieId)) next.delete(movieId);
          else next.add(movieId);
          return next;
        });
      }
    });
  }

  if (error) return <p className="p-4 text-light">{error}</p>;
  if (movies === null) return <Loader />;

  const watchlistMovies = movies.filter((movie) => !watchedIds.has(movie.id));
  const watchedList = movies.filter((movie) => watchedIds.has(movie.id));
  const activeList = tab === "watchlist" ? watchlistMovies : watchedList;

  return (
    <div>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setTab("watchlist")}
          className={`${tabClass} ${tab === "watchlist" ? tabActive : tabInactive}`}
        >
          Watchlist ({watchlistMovies.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("watched")}
          className={`${tabClass} ${tab === "watched" ? tabActive : tabInactive}`}
        >
          Watched ({watchedList.length})
        </button>
      </div>

      {activeList.length === 0 ? (
        <p className="p-4 font-normal text-light">
          {tab === "watchlist"
            ? "No movies have been added to the watchlist yet"
            : "No movies marked as watched yet"}
        </p>
      ) : (
        <ul className="mt-8 flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:justify-center">
          {activeList.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              action={
                <WatchedButton
                  watched={watchedIds.has(movie.id)}
                  onToggle={() => handleToggle(movie.id)}
                />
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}
