import CrewMember from "./CrewMember";
import type { MovieDetails } from "@/lib/types";

export default function Crew({ credits }: { credits: MovieDetails["credits"] }) {
  return (
    <ul className="mb-4">
      <li className="border-t border-muted">
        <CrewMember crew={credits.crew} position="Directing" positionName="Director" />
      </li>
      <li className="border-t border-muted">
        <CrewMember crew={credits.crew} position="Writing" positionName="Writer" />
      </li>
      <li className="border-y border-muted">
        <CrewMember crew={credits.crew} position="Sound" positionName="Music by" />
      </li>
    </ul>
  );
}
