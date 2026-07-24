import { getTitleDetails } from "@/lib/tmdb";
import CastGrid from "@/components/CastGrid";

export default async function CastPage({
  params,
}: {
  params: Promise<{ tvId: string }>;
}) {
  const { tvId } = await params;
  // Deduped with the layout's fetch via cache() — no extra TMDB call.
  const show = await getTitleDetails("tv", tvId);
  return <CastGrid cast={show.credits.cast} />;
}
