'use client';

import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
} from 'react-icons/tb';
import { useSidebar } from './SidebarShell';

// Desktop only: below the `pc` breakpoint navigation lives in MobileMenu's
// full-screen overlay, so there is no sidebar to collapse.
export default function SidebarToggle({
  className = '',
}: {
  className?: string;
}) {
  const { open, toggle } = useSidebar();
  const Icon = open ? TbLayoutSidebarLeftCollapse : TbLayoutSidebarLeftExpand;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={open ? 'Hide sidebar' : 'Show sidebar'}
      aria-expanded={open}
      className={`hidden cursor-pointer text-muted transition-colors duration-300 hover:text-accent pc:block ${className}`}
    >
      {/* Square size, not just w-*: react-icons ships height="1em", so a width
          utility alone leaves the glyph at the inherited 18px font size.
          32px matches the logo's font size and the nav icons' rendered height. */}
      <Icon className="size-8" />
    </button>
  );
}
