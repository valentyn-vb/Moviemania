"use client";

import { BiCameraMovie } from "react-icons/bi";
import { MdLiveTv } from "react-icons/md";
import { BsBookmarkFill } from "react-icons/bs";
import { IoHome } from "react-icons/io5";
import NavLink from "./NavLink";

const linkClass =
  "flex items-center gap-4 pl-8 pr-6 no-underline transition-colors duration-300 mb-6 pc:mb-0 pc:py-6 pc:w-[98%] pc:text-l [&_svg]:w-10 [&_path]:stroke-current";

const links = [
  // Home has to match exactly: NavLink matches by prefix otherwise, and "/" is
  // a prefix of every route.
  { href: "/", label: "Home", Icon: IoHome, exact: true },
  { href: "/movies", label: "Movies", Icon: BiCameraMovie },
  { href: "/tv", label: "TV Shows", Icon: MdLiveTv },
  { href: "/watchlist", label: "Collection", Icon: BsBookmarkFill },
];

export default function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav>
      {links.map(({ href, label, Icon, exact }) => (
        <NavLink
          key={href}
          href={href}
          exact={exact}
          onNavigate={onNavigate}
          className={linkClass}
        >
          <span>{label}</span>
          <Icon />
        </NavLink>
      ))}
    </nav>
  );
}
