"use client";

import { GrHomeRounded } from "react-icons/gr";
import { IoFilmOutline } from "react-icons/io5";
import { BsBookmarkFill } from "react-icons/bs";
import NavLink from "./NavLink";

const linkClass =
  "flex items-center gap-4 no-underline transition-colors duration-300 mb-6 pc:mb-0 pc:py-6 pc:w-[98%] pc:text-l [&_svg]:w-10 [&_path]:stroke-current";
const inactiveClass = "text-muted";
const activeClass = "text-accent pc:bg-accent-soft pc:border-r-8 pc:border-accent";

const links = [
  { href: "/home", label: "Home", Icon: GrHomeRounded },
  { href: "/movies", label: "Movies", Icon: IoFilmOutline },
  { href: "/watchlist", label: "Watchlist", Icon: BsBookmarkFill },
];

export default function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav>
      {links.map(({ href, label, Icon }) => (
        <NavLink
          key={href}
          href={href}
          onNavigate={onNavigate}
          className={linkClass}
          inactiveClassName={inactiveClass}
          activeClassName={activeClass}
        >
          <span>{label}</span>
          <Icon />
        </NavLink>
      ))}
    </nav>
  );
}
