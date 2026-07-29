import type { Metadata } from "next";
import MediaBrowse from "@/components/MediaBrowse";

export const metadata: Metadata = { title: "TV Shows" };

// Browse + search for TV. Same shape as /movies, but the filter set differs:
// TV gets status/type, movies get the age-rating certification.
export default function TvPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <MediaBrowse media="tv" searchParams={searchParams} />;
}
