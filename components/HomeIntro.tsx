import Link from 'next/link';
import { BiCameraMovie } from 'react-icons/bi';
import { BsBookmarkFill } from 'react-icons/bs';
import { MdLiveTv } from 'react-icons/md';

// Same three destinations and icons as the sidebar in Navigation.tsx — this is
// the sighted-on-arrival version of it, with a line on what each one is for.
const destinations = [
  {
    href: '/movies',
    label: 'Movies',
    Icon: BiCameraMovie,
    blurb:
      'Filter by genre, release years, rating and certification, then sort the results any way you like.',
  },
  {
    href: '/tv',
    label: 'TV Shows',
    Icon: MdLiveTv,
    blurb:
      'The same browser for series, with filters for status and format — scripted, miniseries, documentary and more.',
  },
  {
    href: '/watchlist',
    label: 'Collection',
    Icon: BsBookmarkFill,
    blurb:
      'Save what you want to see, tick off what you have watched and keep a list of favourites.',
  },
];

export default function HomeIntro() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-l text-accent">Welcome to Moviemania</h2>

      <p className="max-w-[70ch] font-normal text-light">
        A browser for everything on TMDB. Search films and series, open a title
        for its trailer, cast, crew and reviews, follow an actor through their
        filmography — and keep track of what you have seen and what is next.
      </p>

      <ul className="grid grid-cols-1 gap-4 pc:grid-cols-3">
        {destinations.map(({ href, label, Icon, blurb }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex h-full flex-col gap-2 rounded-lg border border-muted bg-secondary p-6 no-underline transition-colors duration-300 hover:border-accent"
            >
              <Icon className="h-auto w-8 text-accent" />
              <span className="text-light">{label}</span>
              <span className="text-s font-normal text-muted">{blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
