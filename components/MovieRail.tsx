import Link from 'next/link';
import type { Movie } from '@/lib/types';
import MovieCard from './MovieCard';

interface MovieRailProps {
  title: string;
  movies: Movie[];
  /** Target for the "See all" link. Omit it and no link is rendered. */
  href?: string;
}

// A horizontally scrolling poster row rather than the wrapping grid the browse
// and collection pages use: the home page stacks three of these plus a people
// row, and three wrapping grids of twelve posters would run several screens
// deep. CSS only — MovieCard is untouched and just needs shrink-0, since a
// flex row would otherwise squash its fixed width.
export default function MovieRail({ title, movies, href }: MovieRailProps) {
  if (movies.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-bold text-light">{title}</h2>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-s font-normal text-accent no-underline transition-colors duration-300 hover:text-light"
          >
            See all
          </Link>
        )}
      </div>
      {/* The scroll box is a div, not the ul: globals.css zeroes margin and
          padding on ul from an unlayered rule, which outranks Tailwind's
          utilities, so -mx-4/px-4 would silently compute to 0 there.
          -mx-4 px-4 cancels the layout's page padding so posters scroll off
          the edge instead of stopping short of it, and w-max lets the row
          keep that padding at the far end. scroll-px-4 matches it, or the
          first card snaps flush and the row loads already scrolled past its
          own padding. tabIndex keeps the scroller reachable without a
          mouse. */}
      <div
        tabIndex={0}
        role="group"
        aria-label={title}
        className="-mx-4 snap-x scroll-px-4 overflow-x-auto px-4 pb-2 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ul className="flex w-max gap-8 [&>li]:snap-start">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </ul>
      </div>
    </section>
  );
}
