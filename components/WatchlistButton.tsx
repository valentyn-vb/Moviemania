"use client";

import { BsBookmarkFill } from "react-icons/bs";
import { useWatchlist, toggleWatchlist } from "@/lib/watchlist";

export default function WatchlistButton({ movieId }: { movieId: number }) {
  const ids = useWatchlist();
  const active = ids.includes(Number(movieId));

  return (
    <button
      type="button"
      onClick={() => toggleWatchlist(movieId)}
      className={`flex items-center border-none bg-page text-m font-medium transition-colors duration-300 hover:text-accent [&_svg]:ml-1 [&_svg]:h-auto [&_svg]:w-[38px] [&_svg]:transition hover:[&_svg]:fill-accent ${
        active ? "text-accent [&_svg]:fill-accent" : "text-muted [&_svg]:fill-muted"
      }`}
    >
      {active ? "Remove from WatchList" : "Add to Watchlist"}
      <BsBookmarkFill />
    </button>
  );
}
