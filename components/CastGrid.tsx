import Image from "next/image";
import { tmdbImg, PROFILE_SIZE } from "@/lib/image";
import type { CastMember } from "@/lib/types";

// Shared cast grid for movie and tv detail pages.
export default function CastGrid({ cast }: { cast: CastMember[] }) {
  const withPhotos = cast.filter((actor) => actor.profile_path);

  if (withPhotos.length === 0) {
    return <p className="p-4 font-normal text-light">No cast information available.</p>;
  }

  return (
    <ul className="mt-4 grid grid-cols-2 gap-[10px] pc:grid-cols-7 pc:gap-8">
      {withPhotos.map((actor) => (
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
