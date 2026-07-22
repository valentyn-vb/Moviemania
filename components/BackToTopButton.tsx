"use client";

import { RxDoubleArrowUp } from "react-icons/rx";

export default function BackToTopButton() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 animate-bounce text-accent-soft transition-colors hover:text-accent"
    >
      <RxDoubleArrowUp className="h-auto w-[60px]" />
    </button>
  );
}
