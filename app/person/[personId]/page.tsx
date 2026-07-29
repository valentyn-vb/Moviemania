import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPerson } from "@/lib/tmdb";
import { tmdbImg, PROFILE_SIZE } from "@/lib/image";
import { toLongDate } from "@/lib/format";
import type { PersonDetails } from "@/lib/types";
import MovieCard from "@/components/MovieCard";
import BackButton from "@/components/BackButton";

// A working actor has 200+ credits and the tail is bit parts and talk-show
// drop-ins. getPerson sorts by vote count, so the top of the list is the work
// they're actually known for.
const LIMIT = 20;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ personId: string }>;
}): Promise<Metadata> {
  const { personId } = await params;
  try {
    const person = await getPerson(personId);
    return {
      title: person.name,
      description: person.biography || undefined,
      openGraph: person.profile_path
        ? { title: person.name, images: [tmdbImg(person.profile_path, "w780")] }
        : undefined,
    };
  } catch {
    return { title: "Person" };
  }
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;

  // cache()-deduped with generateMetadata's call above — one TMDB request.
  let person: PersonDetails;
  try {
    person = await getPerson(personId);
  } catch {
    notFound();
  }

  const born = toLongDate(person.birthday);
  const died = toLongDate(person.deathday);
  const credits = person.credits.slice(0, LIMIT);

  return (
    <div>
      <BackButton />

      <div className="mb-8 flex flex-col gap-4 pc:flex-row pc:gap-8">
        <div className="relative aspect-[2/3] w-[60vw] max-w-[300px] shrink-0 overflow-hidden rounded-md border border-muted bg-secondary pc:w-[200px]">
          {person.profile_path ? (
            <Image
              src={tmdbImg(person.profile_path, PROFILE_SIZE)}
              alt={person.name}
              fill
              sizes="(max-width: 479px) 60vw, 200px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-s text-muted">
              {person.name}
            </div>
          )}
        </div>

        {/* Every line is optional — TMDB has people with no bio, no photo and
            no dates at all. */}
        <div>
          <h3 className="font-normal text-light">{person.name}</h3>
          {person.known_for_department && (
            <p className="font-normal text-light">{person.known_for_department}</p>
          )}
          {born && <p className="font-normal text-muted">Born {born}</p>}
          {died && <p className="font-normal text-muted">Died {died}</p>}
          {person.place_of_birth && (
            <p className="font-normal text-muted">{person.place_of_birth}</p>
          )}
        </div>
      </div>

      {/* Sections space themselves with flex `gap`, not margins on the h3/p/ul:
          globals.css zeroes those elements' margins from an unlayered rule,
          which outranks Tailwind's margin utilities. */}
      {person.biography && (
        <section className="mt-8 flex flex-col gap-4">
          <h3 className="font-normal text-light">Biography</h3>
          <p className="whitespace-pre-line font-normal text-light">{person.biography}</p>
        </section>
      )}

      <section className="mt-8 flex flex-col gap-4">
        <h3 className="font-normal text-light">Known For</h3>
        {credits.length === 0 ? (
          <p className="font-normal text-light">No credits available.</p>
        ) : (
          /* pc:items-start (vs the shared grid's centering) because the role
             captions vary in height — centered cards make rows look ragged. */
          <ul className="flex flex-col items-center gap-8 pc:flex-row pc:flex-wrap pc:items-start pc:justify-center">
            {credits.map((credit) => (
              // Compound key: a movie and a tv show can share an id, and this
              // list mixes both.
              <MovieCard
                key={`${credit.media_type}:${credit.id}`}
                movie={credit}
                action={
                  credit.role ? (
                    <p className="text-s font-normal text-muted">{credit.role}</p>
                  ) : undefined
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
