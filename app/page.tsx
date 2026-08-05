import HomeHero from '@/components/HomeHero';
import HomeIntro from '@/components/HomeIntro';
import MovieRail from '@/components/MovieRail';
import PeopleRow from '@/components/PeopleRow';
import {
  getMovieList,
  getTitleDetails,
  getTrending,
  getTrendingPeople,
} from '@/lib/tmdb';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  // Absolute: the root layout's "%s | Moviemania" template would otherwise
  // turn this into "Home | Moviemania".
  title: { absolute: 'Moviemania' },
  description:
    'Trending films, what is in theatres now, the highest rated of all time, and the people behind them. Powered by TMDB.',
};

const RAIL_LIMIT = 12;

// Every section below catches its own failure and renders nothing, the same
// way Recommendations.tsx does: a landing page that 500s because one TMDB feed
// hiccuped is worse than one that is a row short.

// The JSX stays outside every try below: React renders the returned element
// after this function has already resolved, so a catch around it would never
// see a render error anyway (react-hooks/error-boundaries enforces this).

async function Hero() {
  let movie;
  try {
    const [top] = await getTrending('movie', 'week');
    if (!top) return null;
    // getTitleDetails is cache()-wrapped, so this is the same request
    // getTrendingPeople already makes for the top trending film.
    movie = await getTitleDetails('movie', String(top.id));
  } catch {
    return null;
  }

  return <HomeHero movie={movie} />;
}

async function TrendingTodayRail() {
  let movies;
  try {
    const [today, week] = await Promise.all([
      getTrending('movie', 'day'),
      getTrending('movie', 'week'),
    ]);
    // The hero is the top of the weekly list and usually leads the daily one
    // too — no point showing it twice.
    const heroId = week[0]?.id;
    movies = today.filter(movie => movie.id !== heroId).slice(0, RAIL_LIMIT);
  } catch {
    return null;
  }

  // "See all" goes to the default popularity.desc listing — lib/filters.ts
  // settled on that as the closest filterable stand-in for trending.
  return <MovieRail title="Trending today" movies={movies} href="/movies" />;
}

async function NowPlayingRail() {
  let movies;
  try {
    movies = (await getMovieList('now_playing')).slice(0, RAIL_LIMIT);
  } catch {
    return null;
  }

  // No "See all": the browse page filters release dates by year, so there is
  // no honest equivalent of "currently in theatres" to link to.
  return <MovieRail title="In theatres now" movies={movies} />;
}

async function TopRatedRail() {
  let movies;
  try {
    movies = (await getMovieList('top_rated')).slice(0, RAIL_LIMIT);
  } catch {
    return null;
  }

  return (
    <MovieRail
      title="Top rated of all time"
      movies={movies}
      href="/movies?sort=vote_average.desc"
    />
  );
}

async function People() {
  let people;
  try {
    people = await getTrendingPeople();
  } catch {
    return null;
  }

  return <PeopleRow people={people} />;
}

// Fixed-height placeholders rather than <Loader />: four 150px spinners
// stacked down the page is worse than four quiet blocks that hold the layout
// still. Heights track a poster row (MovieCard is 60vw wide on mobile, 200px
// on desktop, at a 2/3 aspect).
function RailFallback() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="h-[30px] w-48 animate-pulse rounded-md bg-secondary" />
      <div className="h-[90vw] animate-pulse rounded-md bg-secondary pc:h-[300px]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <Suspense
        fallback={
          <div
            aria-hidden
            className="h-[420px] animate-pulse rounded-lg bg-secondary pc:h-[440px]"
          />
        }
      >
        <Hero />
      </Suspense>

      <HomeIntro />

      <Suspense fallback={<RailFallback />}>
        <TrendingTodayRail />
      </Suspense>

      <Suspense fallback={<RailFallback />}>
        <NowPlayingRail />
      </Suspense>

      <Suspense fallback={<RailFallback />}>
        <TopRatedRail />
      </Suspense>

      <Suspense fallback={<RailFallback />}>
        <People />
      </Suspense>
    </div>
  );
}
