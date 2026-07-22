import { notFound } from "next/navigation";
import { getMoviesByCategory, isCategory } from "@/lib/tmdb";
import MovieList from "@/components/MovieList";

// Only the three known categories are valid routes; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ category: "trending" }, { category: "upcoming" }, { category: "top_rated" }];
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const data = await getMoviesByCategory(category, 1);

  return (
    <MovieList
      key={`category:${category}`}
      initialMovies={data.results}
      initialPage={data.page}
      totalPages={data.total_pages}
      queryString={`category=${category}`}
    />
  );
}
