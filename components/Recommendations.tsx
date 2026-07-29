import { getRecommendations } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import type { MediaType } from "@/lib/types";

// TMDB returns 20; a full extra page of cards under the cast grid overwhelms
// the title you're actually looking at.
const LIMIT = 12;

// The bottom-of-page "more like this" row, rendered for both /movies/[movieId]
// and /tv/[tvId] from TitleDetailLayout. Server component — MovieCard needs no
// client JS, and getRecommendations already stamps media_type so the cards link
// back into the right section.
export default async function Recommendations({
  mediaType,
  id,
}: {
  mediaType: MediaType;
  id: string;
}) {
  let items;
  try {
    items = await getRecommendations(mediaType, id);
  } catch {
    // A supplementary row isn't worth failing the page over.
    return null;
  }

  // Silent when empty, like Trailer with no video — no heading over a void.
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h3 className="mb-4 font-normal text-light">More Like This</h3>
      <ul className="mt-8 flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:justify-center">
        {items.slice(0, LIMIT).map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </ul>
    </section>
  );
}
