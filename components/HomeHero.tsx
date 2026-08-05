import Image from 'next/image';
import Link from 'next/link';
import { BsFillStarFill } from 'react-icons/bs';
import { toHoursAndMinutes } from '@/lib/format';
import { BACKDROP_SIZE, tmdbImg } from '@/lib/image';
import type { MovieDetails } from '@/lib/types';

const GENRE_LIMIT = 3;

export default function HomeHero({ movie }: { movie: MovieDetails }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;
  const rating =
    movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;

  return (
    // The backdrop is an absolutely positioned background rather than an
    // aspect-ratio box with the copy overlaid on top: the section takes its
    // height from the text, so a long title can never spill out of the image.
    <section className="relative isolate overflow-hidden rounded-lg border border-muted bg-secondary">
      {movie.backdrop_path && (
        <>
          <Image
            src={tmdbImg(movie.backdrop_path, BACKDROP_SIZE)}
            alt=""
            fill
            priority
            sizes="(max-width: 479px) 100vw, 80vw"
            className="-z-10 object-cover"
          />
          {/* Scrim built from the page token, so it inverts with the theme
              and the copy stays legible in both. */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-page via-page/85 to-page/40" />
        </>
      )}

      <div className="flex flex-col gap-4 p-6 pc:min-h-[440px] pc:justify-end pc:p-10">
        <p className="text-xs uppercase tracking-widest text-accent">
          Trending this week
        </p>

        <h1 className="font-heading text-l leading-none text-light pc:text-xl">
          {movie.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-normal text-light">
          {rating && (
            <span className="flex items-center gap-2">
              <BsFillStarFill className="w-4 fill-[gold]" />
              {rating}
            </span>
          )}
          {year && <span>{year}</span>}
          {movie.runtime && <span>{toHoursAndMinutes(movie.runtime)}</span>}
        </div>

        {movie.genres.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {movie.genres.slice(0, GENRE_LIMIT).map(genre => (
              <li
                key={genre.id}
                className="rounded-md border-2 border-muted px-4 py-1 text-s font-normal text-accent"
              >
                {genre.name}
              </li>
            ))}
          </ul>
        )}

        {movie.overview && (
          <p className="line-clamp-3 max-w-[70ch] font-normal text-light">
            {movie.overview}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          <Link
            href={`/movies/${movie.id}`}
            className="rounded-md bg-accent px-6 py-3 text-page no-underline transition-opacity hover:opacity-90"
          >
            View details
          </Link>
          <Link
            href="/movies"
            className="rounded-md border border-muted px-6 py-3 text-light no-underline transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            Browse all movies
          </Link>
        </div>
      </div>
    </section>
  );
}
