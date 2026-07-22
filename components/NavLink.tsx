"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  /** Classes applied in every state. */
  className?: string;
  /** Added when the link is active. */
  activeClassName?: string;
  /** Added when the link is not active. */
  inactiveClassName?: string;
  /** Match the pathname exactly instead of by prefix. */
  exact?: boolean;
  /** Fired on click (e.g. to close the mobile menu). */
  onNavigate?: () => void;
}

export default function NavLink({
  href,
  children,
  className = "",
  activeClassName = "",
  inactiveClassName = "",
  exact = false,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${className} ${isActive ? activeClassName : inactiveClassName}`}
    >
      {children}
    </Link>
  );
}
