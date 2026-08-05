import Image from 'next/image';
import Link from 'next/link';
import { PROFILE_SIZE, tmdbImg } from '@/lib/image';
import type { PersonSummary } from '@/lib/types';

// Same scrolling row as MovieRail, with circular crops instead of posters.
export default function PeopleRow({ people }: { people: PersonSummary[] }) {
  if (people.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-bold text-light">People to watch</h2>
        <p className="text-s font-normal text-muted">
          Billed in the films trending this week.
        </p>
      </div>

      {/* Scroll box on a div rather than the ul — see the note in
          MovieRail.tsx about globals.css zeroing ul margin and padding. */}
      <div
        tabIndex={0}
        role="group"
        aria-label="People to watch"
        className="-mx-4 snap-x scroll-px-4 overflow-x-auto px-4 pb-2 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <ul className="flex w-max gap-6 [&>li]:snap-start">
          {people.map(person => (
            <li key={person.id} className="w-[140px]">
              <Link
                href={`/person/${person.id}`}
                className="flex flex-col items-center gap-2 no-underline"
              >
                {/* object-top, not the default centre: a square crop of a
                    portrait otherwise slices the top of the head off. */}
                <div className="relative aspect-square w-full overflow-hidden rounded-full border border-muted bg-secondary transition duration-300 hover:scale-[1.03] hover:border-accent">
                  <Image
                    src={tmdbImg(person.profile_path, PROFILE_SIZE)}
                    alt={person.name}
                    fill
                    sizes="140px"
                    className="object-cover object-top"
                  />
                </div>
                <span className="text-center text-s text-light">
                  {person.name}
                </span>
                <span className="line-clamp-2 text-center text-xs font-normal text-muted">
                  {person.knownFor}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
