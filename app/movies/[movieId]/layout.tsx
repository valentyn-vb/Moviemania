import type { Metadata } from "next";
import { getTitleDetails } from "@/lib/tmdb";
import { tmdbImg } from "@/lib/image";
import TitleDetailLayout from "@/components/TitleDetailLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ movieId: string }>;
}): Promise<Metadata> {
  const { movieId } = await params;
  try {
    const movie = await getTitleDetails("movie", movieId);
    return {
      title: movie.title,
      description: movie.overview,
      openGraph: movie.poster_path
        ? { title: movie.title, images: [tmdbImg(movie.poster_path, "w780")] }
        : undefined,
    };
  } catch {
    return { title: "Movie" };
  }
}

export default async function MovieDetailsLayout({
  params,
  children,
}: {
  params: Promise<{ movieId: string }>;
  children: React.ReactNode;
}) {
  const { movieId } = await params;
  return (
    <TitleDetailLayout mediaType="movie" id={movieId}>
      {children}
    </TitleDetailLayout>
  );
}
