import { notFound } from "next/navigation";
import { getListing, isCategory, isMediaType, getMediaCategoryParams } from "@/lib/tmdb";
import MovieList from "@/components/MovieList";

// Only the known (mediaType, category) pairs are valid routes; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return getMediaCategoryParams();
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ mediaType: string; category: string }>;
}) {
  const { mediaType, category } = await params;
  if (!isMediaType(mediaType) || !isCategory(mediaType, category)) notFound();

  const data = await getListing(mediaType, category, 1);

  return (
    <MovieList
      key={`${mediaType}:${category}`}
      initialMovies={data.results}
      initialPage={data.page}
      totalPages={data.total_pages}
      queryString={`media=${mediaType}&category=${category}`}
    />
  );
}
