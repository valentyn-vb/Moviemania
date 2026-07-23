"use client";

import { GrHomeRounded } from "react-icons/gr";
import { BsBookmarkFill } from "react-icons/bs";
import NavLink from "./NavLink";

const linkClass =
  "flex items-center gap-4 pl-8 pr-6 no-underline transition-colors duration-300 mb-6 pc:mb-0 pc:py-6 pc:w-[98%] pc:text-l [&_svg]:w-10 [&_path]:stroke-current";

const links = [
  { href: "/home", label: "Home", Icon: GrHomeRounded },
  { href: "/watchlist", label: "Collection", Icon: BsBookmarkFill },
];

export default function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav>
      {links.map(({ href, label, Icon }) => (
        <NavLink key={href} href={href} onNavigate={onNavigate} className={linkClass}>
          <span>{label}</span>
          <Icon />
        </NavLink>
      ))}
    </nav>
  );
}
