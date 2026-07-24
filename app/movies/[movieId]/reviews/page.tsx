import { getTitleDetails } from "@/lib/tmdb";
import ReviewsList from "@/components/ReviewsList";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;
  const movie = await getTitleDetails("movie", movieId);
  return <ReviewsList reviews={movie.reviews.results} />;
}
