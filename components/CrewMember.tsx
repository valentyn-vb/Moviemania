import Link from "next/link";
import type { CrewMember as CrewMemberData } from "@/lib/types";

interface CrewMemberProps {
  crew: CrewMemberData[];
  position: string;
  positionName: string;
}

export default function CrewMember({ crew, position, positionName }: CrewMemberProps) {
  const member = crew.find((m) => m.known_for_department === position);
  const nameClass = "block font-normal text-accent";

  return (
    <div className="flex justify-start gap-8 py-4">
      <h3 className="text-light">{positionName}:</h3>
      {/* No match means there's no id to link to — the placeholder stays inert. */}
      {member ? (
        <Link href={`/person/${member.id}`} className={nameClass}>
          {member.name}
        </Link>
      ) : (
        <span className={nameClass}>Unknown author</span>
      )}
    </div>
  );
}
