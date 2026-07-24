import type { Review } from "@/lib/types";

// Shared reviews list for movie and tv detail pages.
export default function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <p className="p-4 font-normal text-light">No review for this title yet</p>;
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
