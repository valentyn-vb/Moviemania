"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import {
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
  IoHeart,
  IoHeartOutline,
} from "react-icons/io5";
import { useWatchlist, toggleWatchlist, isInWatchlist } from "@/lib/watchlist";
import { toggleWatched, toggleFavorite } from "@/app/watchlist/actions";
import type { MediaType } from "@/lib/types";

type Variant = "detail" | "card";
type IconType = React.ComponentType<{ className?: string }>;

// Icon size per usage — larger on the movie details page, smaller on cards.
const SIZE: Record<Variant, string> = {
  detail: "[&_svg]:w-9",
  card: "[&_svg]:w-6",
};

function IconToggle({
  active,
  label,
  onClick,
  ActiveIcon,
  InactiveIcon,
  sizeClass,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  ActiveIcon: IconType;
  InactiveIcon: IconType;
  sizeClass: string;
}) {
  return (
    <div className="group relative flex justify-center">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`flex items-center border-none bg-transparent transition-colors duration-300 hover:text-accent [&_svg]:h-auto [&_svg]:transition hover:[&_svg]:fill-accent ${sizeClass} ${
          active ? "text-accent [&_svg]:fill-accent" : "text-muted [&_svg]:fill-muted"
        }`}
      >
        {active ? <ActiveIcon /> : <InactiveIcon />}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-secondary px-2 py-1 text-s font-normal text-light opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

export default function MovieActions({
  movieId,
  mediaType,
  authed,
  initialWatched = false,
  initialFavorite = false,
  variant = "card",
  onWatchedChange,
  onFavoriteChange,
}: {
  movieId: number;
  mediaType: MediaType;
  authed: boolean;
  initialWatched?: boolean;
  initialFavorite?: boolean;
  variant?: Variant;
  onWatchedChange?: (watched: boolean) => void;
  onFavoriteChange?: (favorite: boolean) => void;
}) {
  const router = useRouter();
  const watchlistItems = useWatchlist();
  const inWatchlist = isInWatchlist(watchlistItems, movieId, mediaType);
  const [watched, setWatched] = useState(initialWatched);
  const [favorite, setFavorite] = useState(initialFavorite);
  const [, startTransition] = useTransition();

  const sizeClass = SIZE[variant];

  function handleWatched() {
    if (!authed) {
      router.push("/sign-in");
      return;
    }
    const next = !watched;
    setWatched(next);
    onWatchedChange?.(next);
    startTransition(async () => {
      try {
        const { watched: server } = await toggleWatched(movieId, mediaType);
        setWatched(server);
        onWatchedChange?.(server);
      } catch {
        // Revert the optimistic flip if the server call failed.
        setWatched(!next);
        onWatchedChange?.(!next);
      }
    });
  }

  function handleFavorite() {
    if (!authed) {
      router.push("/sign-in");
      return;
    }
    const next = !favorite;
    setFavorite(next);
    onFavoriteChange?.(next);
    startTransition(async () => {
      try {
        const { favorite: server } = await toggleFavorite(movieId, mediaType);
        setFavorite(server);
        onFavoriteChange?.(server);
      } catch {
        setFavorite(!next);
        onFavoriteChange?.(!next);
      }
    });
  }

  return (
    <div className="flex items-center justify-center gap-6">
      <IconToggle
        active={inWatchlist}
        label={inWatchlist ? "Remove from Watch List" : "Add to Watch List"}
        onClick={() => toggleWatchlist(movieId, mediaType)}
        ActiveIcon={BsBookmarkFill}
        InactiveIcon={BsBookmark}
        sizeClass={sizeClass}
      />
      <IconToggle
        active={watched}
        label={watched ? "Watched" : "Mark as Watched"}
        onClick={handleWatched}
        ActiveIcon={IoCheckmarkCircle}
        InactiveIcon={IoCheckmarkCircleOutline}
        sizeClass={sizeClass}
      />
      <IconToggle
        active={favorite}
        label={favorite ? "Favorited" : "Add to Favorites"}
        onClick={handleFavorite}
        ActiveIcon={IoHeart}
        InactiveIcon={IoHeartOutline}
        sizeClass={sizeClass}
      />
    </div>
  );
}
