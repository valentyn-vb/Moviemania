import type { Metadata } from "next";
import { getTitleDetails } from "@/lib/tmdb";
import { tmdbImg } from "@/lib/image";
import TitleDetailLayout from "@/components/TitleDetailLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tvId: string }>;
}): Promise<Metadata> {
  const { tvId } = await params;
  try {
    const show = await getTitleDetails("tv", tvId);
    return {
      title: show.title,
      description: show.overview,
      openGraph: show.poster_path
        ? { title: show.title, images: [tmdbImg(show.poster_path, "w780")] }
        : undefined,
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TvDetailsLayout({
  params,
  children,
}: {
  params: Promise<{ tvId: string }>;
  children: React.ReactNode;
}) {
  const { tvId } = await params;
  return (
    <TitleDetailLayout mediaType="tv" id={tvId}>
      {children}
    </TitleDetailLayout>
  );
}
