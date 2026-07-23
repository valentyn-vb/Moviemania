"use client";

import { IoCheckmarkCircle, IoCheckmarkCircleOutline } from "react-icons/io5";

export default function WatchedButton({
  watched,
  onToggle,
}: {
  watched: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center border-none bg-page text-s font-medium transition-colors duration-300 hover:text-accent [&_svg]:ml-1 [&_svg]:h-auto [&_svg]:w-6 [&_svg]:transition hover:[&_svg]:fill-accent ${
        watched ? "text-accent [&_svg]:fill-accent" : "text-muted [&_svg]:fill-muted"
      }`}
    >
      {watched ? "Watched" : "Mark as Watched"}
      {watched ? <IoCheckmarkCircle /> : <IoCheckmarkCircleOutline />}
    </button>
  );
}
