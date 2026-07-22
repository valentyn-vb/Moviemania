"use client";

import { useEffect, useState } from "react";
import MovieCard from "@/components/MovieCard";
import Loader from "@/components/Loader";
import { getWatchlistIds } from "@/lib/watchlist";
import { fetchWatchlistMovies } from "./actions";
import type { MovieDetails } from "@/lib/types";

export default function WatchlistPage() {
  const [movies, setMovies] = useState<MovieDetails[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Read ids after mount (localStorage is client-only), then fetch server-side.
    fetchWatchlistMovies(getWatchlistIds())
      .then((res) => {
        if (!cancelled) setMovies(res);
      })
      .catch(() => {
        if (!cancelled) setError("Whoops, something went wrong loading your watchlist.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="p-4 text-light">{error}</p>;
  if (movies === null) return <Loader />;
  if (movies.length === 0) {
    return (
      <p className="p-4 font-normal text-light">
        No movies have been added to the watchlist yet
      </p>
    );
  }

  return (
    <ul className="mt-8 flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:justify-center">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </ul>
  );
}
