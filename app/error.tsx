"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-4 text-light">
      <p className="mb-4 font-normal">
        Ooops... something went wrong. The page might be temporarily unavailable.
      </p>
      <button type="button" onClick={reset} className="text-accent">
        Try again
      </button>
    </div>
  );
}
