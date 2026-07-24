import { notFound, redirect } from "next/navigation";
import { getCategories, isMediaType } from "@/lib/tmdb";

// /home/movie and /home/tv have no content of their own — send them to that
// media's first category tab.
export default async function MediaIndexPage({
  params,
}: {
  params: Promise<{ mediaType: string }>;
}) {
  const { mediaType } = await params;
  if (!isMediaType(mediaType)) notFound();
  redirect(`/home/${mediaType}/${getCategories(mediaType)[0]}`);
}
