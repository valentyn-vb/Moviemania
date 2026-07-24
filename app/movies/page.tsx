import { Suspense } from "react";
import type { Metadata } from "next";
import Searchbar from "@/components/Searchbar";
import MovieList from "@/components/MovieList";
import Loader from "@/components/Loader";
import { searchTitles } from "@/lib/tmdb";

export const metadata: Metadata = { title: "Search" };

async function SearchResults({ query }: { query: string }) {
  const data = await searchTitles("movie", query, 1);
  return (
    <MovieList
      key={`query:${query}`}
      initialMovies={data.results}
      initialPage={data.page}
      totalPages={data.total_pages}
      queryString={`media=movie&query=${encodeURIComponent(query)}`}
    />
  );
}

export default async function MoviesSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string | string[] }>;
}) {
  const { query: rawQuery } = await searchParams;
  const query = Array.isArray(rawQuery) ? rawQuery[0] ?? "" : rawQuery ?? "";

  return (
    <>
      <Searchbar key={query} defaultQuery={query} />
      {query ? (
        // Page-local Suspense: gives search a skeleton without wrapping the
        // sibling /movies/[movieId] route (which needs render-time notFound()
        // to set a real 404 status).
        <Suspense key={query} fallback={<Loader />}>
          <SearchResults query={query} />
        </Suspense>
      ) : (
        <p className="p-4 font-normal text-light">Search for a movie to get started.</p>
      )}
    </>
  );
}
