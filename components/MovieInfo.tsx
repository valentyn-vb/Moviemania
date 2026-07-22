import { toHoursAndMinutes } from "@/lib/format";

interface MovieInfoProps {
  release_date: string;
  runtime: number | null;
  imdb_id: string | null;
}

export default function MovieInfo({ release_date, runtime, imdb_id }: MovieInfoProps) {
  return (
    <div className="inline-grid grid-cols-[auto_auto_auto] items-center gap-[6px]">
      <p className="flex items-center font-normal text-light">
        {release_date ? release_date.slice(0, 4) : "—"} <span>&nbsp;•</span>
      </p>
      <p className="flex items-center font-normal text-light">
        {toHoursAndMinutes(runtime)} <span>&nbsp;•</span>
      </p>
      {imdb_id ? (
        <a
          href={`https://www.imdb.com/title/${imdb_id}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex text-accent"
        >
          IMDb
        </a>
      ) : (
        <span className="text-muted">IMDb</span>
      )}
    </div>
  );
}
