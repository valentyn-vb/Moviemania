import type { Video } from "@/lib/types";

export default function Trailer({ videos, title }: { videos: Video[]; title: string }) {
  const trailer =
    videos.find((v) => v.name.toLowerCase().includes("trailer")) ?? videos[0];

  if (!trailer?.key) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-lg">
      <iframe
        title={title}
        src={`https://www.youtube.com/embed/${trailer.key}`}
        allowFullScreen
        allow="autoplay; encrypted-media"
        className="m-0 h-[calc(100vw/1.77)] w-full border-0 pc:h-[calc(800px/1.77)]"
      />
    </div>
  );
}
