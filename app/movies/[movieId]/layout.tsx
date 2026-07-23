import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovieDetails } from "@/lib/tmdb";
import type { MovieDetails } from "@/lib/types";
import { tmdbImg } from "@/lib/image";
import MovieInfo from "@/components/MovieInfo";
import Crew from "@/components/Crew";
import Trailer from "@/components/Trailer";
import MovieActions from "@/components/MovieActions";
import BackButton from "@/components/BackButton";
import NavLink from "@/components/NavLink";
import { getMovieStatus } from "@/app/watchlist/actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ movieId: string }>;
}): Promise<Metadata> {
  const { movieId } = await params;
  try {
    const movie = await getMovieDetails(movieId);
    return {
      title: movie.title,
      description: movie.overview,
      openGraph: movie.poster_path
        ? { title: movie.title, images: [tmdbImg(movie.poster_path, "w780")] }
        : undefined,
    };
  } catch {
    return { title: "Movie" };
  }
}

const tabClass =
  "mr-4 cursor-pointer no-underline transition-[color,font-size] duration-300 hover:text-accent";
const tabInactive = "text-muted";
const tabActive = "text-accent";

export default async function MovieDetailsLayout({
  params,
  children,
}: {
  params: Promise<{ movieId: string }>;
  children: React.ReactNode;
}) {
  const { movieId } = await params;
  // cache()-wrapped: the cast/reviews child pages reuse this same fetch.
  let movie: MovieDetails;
  try {
    movie = await getMovieDetails(movieId);
  } catch {
    notFound();
  }
  const { title, overview, genres, videos, release_date, runtime, imdb_id, credits, id } =
    movie;
  const status = await getMovieStatus(id);

  return (
    <div>
      <BackButton />
      <h3 className="mb-4 font-normal text-light">{title}</h3>
      <Trailer videos={videos.results} title={title} />

      <div className="mb-4 flex items-center justify-between">
        <MovieInfo release_date={release_date} runtime={runtime} imdb_id={imdb_id} />
        <MovieActions
          movieId={id}
          variant="detail"
          authed={status.authed}
          initialWatched={status.watched}
          initialFavorite={status.favorite}
        />
      </div>

      <div className="mb-8 flex gap-4">
        {genres.slice(0, 3).map((genre) => (
          <span
            key={genre.id}
            className="rounded-md border-2 border-muted px-4 py-1 text-s font-normal text-accent"
          >
            {genre.name}
          </span>
        ))}
      </div>

      <h3 className="mb-4 font-normal text-light">Overview</h3>
      <p className="font-normal text-light">{overview}</p>

      <Crew credits={credits} />

      <div className="my-4">
        <NavLink
          href={`/movies/${movieId}/cast`}
          exact
          className={tabClass}
          inactiveClassName={tabInactive}
          activeClassName={tabActive}
        >
          Cast
        </NavLink>
        <NavLink
          href={`/movies/${movieId}/reviews`}
          exact
          className={tabClass}
          inactiveClassName={tabInactive}
          activeClassName={tabActive}
        >
          Reviews
        </NavLink>
      </div>

      {children}
    </div>
  );
}
