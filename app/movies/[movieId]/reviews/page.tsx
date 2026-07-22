import { getMovieDetails } from "@/lib/tmdb";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;
  const movie = await getMovieDetails(movieId);
  const reviews = movie.reviews.results;

  if (reviews.length === 0) {
    return <p className="p-4 font-normal text-light">No review for this movie yet</p>;
  }

  return (
    <ul className="mt-4">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="mb-8 overflow-hidden rounded-md border border-muted p-4 last:mb-0"
        >
          <h3 className="mb-4 font-normal text-light">{review.author}</h3>
          <p className="text-justify font-normal leading-[25px] text-light">
            {review.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
