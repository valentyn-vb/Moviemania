import Link from "next/link";
import Image from "next/image";
import { BsFillStarFill } from "react-icons/bs";
import { tmdbImg, POSTER_SIZE } from "@/lib/image";
import type { Movie } from "@/lib/types";

export default function MovieCard({ movie }: { movie: Movie }) {
  const title = movie.title ?? movie.name ?? "Untitled";
  const rating =
    typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : null;

  return (
    <li className="w-[60vw] max-w-[300px] pc:w-[200px]">
      <Link href={`/movies/${movie.id}`} className="block">
        <div className="relative overflow-hidden rounded-[20px] border border-muted transition duration-300 hover:scale-[1.03] hover:shadow-[0px_2px_2px_rgba(255,255,255,0.12),0px_5px_5px_rgba(255,255,255,0.06),2px_5px_7px_rgba(255,255,255,0.16)]">
          <div className="relative aspect-[2/3] w-full bg-secondary">
            {movie.poster_path ? (
              <Image
                src={tmdbImg(movie.poster_path, POSTER_SIZE)}
                alt={title}
                fill
                sizes="(max-width: 479px) 60vw, 200px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-center text-s text-muted">
                {title}
              </div>
            )}
          </div>
          {rating && (
            <div className="absolute right-0 top-0 flex min-h-[36px] w-[30%] items-center justify-center rounded-bl-[50px] rounded-tr-[20px] bg-[rgba(232,232,232,0.15)] text-[22px] font-normal text-light backdrop-blur-[2.5px]">
              <BsFillStarFill className="mr-2 w-5 fill-[gold]" />
              <span>{rating}</span>
            </div>
          )}
        </div>
      </Link>
    </li>
  );
}
