"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import MovieCard from "./MovieCard";
import Loader from "./Loader";
import BackToTopButton from "./BackToTopButton";
import type { Movie } from "@/lib/types";

interface MovieListProps {
  initialMovies: Movie[];
  initialPage: number;
  totalPages: number;
  /** Query string for /api/movies, e.g. "category=trending" or "query=batman". */
  queryString: string;
}

// Seeded with the server-rendered first page; loads more via the /api/movies
// route handler on scroll. Remount (via a `key` on the query) resets state.
export default function MovieList({
  initialMovies,
  initialPage,
  totalPages,
  queryString,
}: MovieListProps) {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(initialPage < totalPages);
  const [error, setError] = useState<string | null>(null);

  // Synchronous re-entry guard so React StrictMode's double-invoke (dev) and
  // rapid scroll events don't append the same page twice.
  const fetchingRef = useRef(false);

  const { ref: topRef, inView: topInView } = useInView({ threshold: 0 });
  const { ref: loadRef, inView: loadInView } = useInView({
    rootMargin: "200px",
    threshold: 0,
  });

  useEffect(() => {
    if (!loadInView || !hasNextPage || fetchingRef.current) return;

    fetchingRef.current = true;
    setIsLoading(true);
    const controller = new AbortController();
    const nextPage = page + 1;

    fetch(`/api/movies?${queryString}&page=${nextPage}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load more movies");
        return res.json() as Promise<{ results: Movie[]; total_pages: number }>;
      })
      .then((data) => {
        setMovies((prev) => [...prev, ...data.results]);
        setPage(nextPage);
        setHasNextPage(nextPage < data.total_pages);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        fetchingRef.current = false;
        setIsLoading(false);
      });

    return () => {
      controller.abort();
      fetchingRef.current = false;
    };
  }, [loadInView, hasNextPage, page, queryString]);

  if (movies.length === 0) {
    return <p className="p-4 font-normal text-light">Sorry, no movies found for this search :(</p>;
  }

  return (
    <>
      <div ref={topRef} aria-hidden className="h-px w-full" />
      <ul className="mt-8 flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:justify-center">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </ul>
      <div ref={loadRef} aria-hidden className="h-px w-full" />
      {isLoading && <Loader />}
      {error && <p className="p-4 text-light">Whoops, something went wrong: {error}</p>}
      {!topInView && <BackToTopButton />}
    </>
  );
}
