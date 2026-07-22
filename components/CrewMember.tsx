import type { CrewMember as CrewMemberData } from "@/lib/types";

interface CrewMemberProps {
  crew: CrewMemberData[];
  position: string;
  positionName: string;
}

export default function CrewMember({ crew, position, positionName }: CrewMemberProps) {
  const member = crew.find((m) => m.known_for_department === position);
  const name = member?.name || "Unknown author";

  return (
    <div className="flex justify-start gap-8 py-4">
      <h3 className="text-light">{positionName}:</h3>
      <span className="block font-normal text-accent">{name}</span>
    </div>
  );
}
