import { getTitleDetails } from "@/lib/tmdb";
import ReviewsList from "@/components/ReviewsList";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ tvId: string }>;
}) {
  const { tvId } = await params;
  const show = await getTitleDetails("tv", tvId);
  return <ReviewsList reviews={show.reviews.results} />;
}
