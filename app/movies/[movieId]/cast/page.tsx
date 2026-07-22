import Image from "next/image";
import { getMovieDetails } from "@/lib/tmdb";
import { tmdbImg, PROFILE_SIZE } from "@/lib/image";

export default async function CastPage({
  params,
}: {
  params: Promise<{ movieId: string }>;
}) {
  const { movieId } = await params;
  // Deduped with the layout's fetch via cache() — no extra TMDB call.
  const movie = await getMovieDetails(movieId);
  const cast = movie.credits.cast.filter((actor) => actor.profile_path);

  if (cast.length === 0) {
    return <p className="p-4 font-normal text-light">No cast information available.</p>;
  }

  return (
    <ul className="mt-4 grid grid-cols-2 gap-[10px] pc:grid-cols-7 pc:gap-8">
      {cast.map((actor) => (
        <li
          key={actor.id}
          className="overflow-hidden rounded-md border border-muted transition duration-300 hover:scale-[1.03]"
        >
          <div className="relative aspect-[2/3] w-full bg-secondary">
            <Image
              src={tmdbImg(actor.profile_path as string, PROFILE_SIZE)}
              alt={actor.name}
              fill
              sizes="(max-width: 479px) 50vw, 14vw"
              className="object-cover"
            />
          </div>
          <div className="p-[6px]">
            <p className="font-normal leading-5 text-light">{actor.name}</p>
            <p className="font-normal leading-5 text-light">
              <b>Character: </b>
              {actor.character}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
