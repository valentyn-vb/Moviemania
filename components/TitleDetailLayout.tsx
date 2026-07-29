import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTitleDetails } from "@/lib/tmdb";
import type { MediaType, MovieDetails } from "@/lib/types";
import MovieInfo from "@/components/MovieInfo";
import Crew from "@/components/Crew";
import Trailer from "@/components/Trailer";
import MovieActions from "@/components/MovieActions";
import BackButton from "@/components/BackButton";
import NavLink from "@/components/NavLink";
import Recommendations from "@/components/Recommendations";
import Loader from "@/components/Loader";
import { getMovieStatus } from "@/app/watchlist/actions";

const tabClass =
  "mr-4 cursor-pointer no-underline transition-[color,font-size] duration-300 hover:text-accent";
const tabInactive = "text-muted";
const tabActive = "text-accent";

// Shared detail chrome for both /movies/[movieId] and /tv/[tvId]. TV payloads
// are normalized to MovieDetails in getTitleDetails, so this renders identically
// for both; only the media type (for the action toggles) and the Cast/Reviews
// tab base path differ.
export default async function TitleDetailLayout({
  mediaType,
  id,
  children,
}: {
  mediaType: MediaType;
  id: string;
  children: React.ReactNode;
}) {
  // cache()-wrapped: the cast/reviews child pages reuse this same fetch.
  let title: MovieDetails;
  try {
    title = await getTitleDetails(mediaType, id);
  } catch {
    notFound();
  }
  const { title: name, overview, genres, videos, release_date, runtime, imdb_id, credits, id: titleId } =
    title;
  const status = await getMovieStatus(titleId, mediaType);
  const basePath = mediaType === "tv" ? "tv" : "movies";

  return (
    <div>
      <BackButton />
      <h3 className="mb-4 font-normal text-light">{name}</h3>
      <Trailer videos={videos.results} title={name} />

      <div className="mb-4 flex items-center justify-between">
        <MovieInfo release_date={release_date} runtime={runtime} imdb_id={imdb_id} />
        <MovieActions
          movieId={titleId}
          mediaType={mediaType}
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
          href={`/${basePath}/${id}/cast`}
          exact
          className={tabClass}
          inactiveClassName={tabInactive}
          activeClassName={tabActive}
        >
          Cast
        </NavLink>
        <NavLink
          href={`/${basePath}/${id}/reviews`}
          exact
          className={tabClass}
          inactiveClassName={tabInactive}
          activeClassName={tabActive}
        >
          Reviews
        </NavLink>
      </div>

      {children}

      {/* Its own fetch, so it streams in rather than holding up the trailer. */}
      <Suspense fallback={<Loader />}>
        <Recommendations mediaType={mediaType} id={id} />
      </Suspense>
    </div>
  );
}
