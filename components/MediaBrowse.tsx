import { Suspense } from "react";
import Searchbar from "./Searchbar";
import FilterBar from "./FilterBar";
import MovieList from "./MovieList";
import Loader from "./Loader";
import { discoverTitles, getGenres, searchTitles } from "@/lib/tmdb";
import { parseFilters, serializeFilters, type Filters } from "@/lib/filters";
import type { MediaType } from "@/lib/types";

// The browse + search view for one media type, shared by /movies and /tv. Both
// modes live on one route because both are just search params: `?query=` runs a
// search, anything else runs a filtered /discover listing.
//
// The two are mutually exclusive rather than combined: /search/{media} accepts
// no genre, sort or vote params, so the filter bar would silently do nothing
// against a search. It's hidden while a query is active.

async function SearchResults({ media, query }: { media: MediaType; query: string }) {
  const data = await searchTitles(media, query, 1);
  return (
    <MovieList
      key={`query:${query}`}
      initialMovies={data.results}
      initialPage={data.page}
      totalPages={data.total_pages}
      queryString={`media=${media}&query=${encodeURIComponent(query)}`}
    />
  );
}

async function BrowseResults({ media, filters }: { media: MediaType; filters: Filters }) {
  const data = await discoverTitles(media, filters, 1);
  const qs = serializeFilters(media, filters);
  return (
    <MovieList
      key={`browse:${qs}`}
      initialMovies={data.results}
      initialPage={data.page}
      totalPages={data.total_pages}
      queryString={qs ? `media=${media}&${qs}` : `media=${media}`}
    />
  );
}

// Split out so the genre fetch streams instead of blocking the searchbar.
async function BrowseFilters({ media }: { media: MediaType }) {
  const genres = await getGenres(media);
  return <FilterBar media={media} genres={genres} />;
}

export default async function MediaBrowse({
  media,
  searchParams,
}: {
  media: MediaType;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const rawQuery = params.query;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const filters = parseFilters(media, params);

  return (
    <>
      <Searchbar key={query} defaultQuery={query} mediaType={media} />
      {query ? (
        // Page-local Suspense: gives search a skeleton without wrapping the
        // sibling detail route (which needs render-time notFound() to set a
        // real 404 status).
        <Suspense key={query} fallback={<Loader />}>
          <SearchResults media={media} query={query} />
        </Suspense>
      ) : (
        <>
          <Suspense fallback={<div className="mt-8 h-[42px]" />}>
            <BrowseFilters media={media} />
          </Suspense>
          <Suspense key={serializeFilters(media, filters)} fallback={<Loader />}>
            <BrowseResults media={media} filters={filters} />
          </Suspense>
        </>
      )}
    </>
  );
}
