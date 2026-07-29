import type { Metadata } from "next";
import MediaBrowse from "@/components/MediaBrowse";

export const metadata: Metadata = { title: "Movies" };

// Browse + search for movies. Filter state lives entirely in the search params
// (see lib/filters.ts), which is what opts this route into dynamic rendering.
export default function MoviesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <MediaBrowse media="movie" searchParams={searchParams} />;
}
