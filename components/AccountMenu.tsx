"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  IoPersonCircleOutline,
  IoChevronDown,
  IoLogInOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import ThemeToggle from "./ThemeToggle";
import { logOut } from "@/lib/auth/logoutAction";

const triggerClass =
  "flex w-full items-center gap-4 border-none bg-transparent pl-8 pr-6 text-left text-muted no-underline transition-colors duration-300 hover:text-accent pc:py-6 pc:w-[98%] pc:text-l [&_svg]:w-10";
const itemClass =
  "flex w-full items-center gap-3 border-none bg-transparent px-4 py-3 text-left text-muted no-underline transition-colors duration-300 hover:text-accent [&_svg]:w-6";

// Account/settings dropdown holding the theme switch and Sign out (or Sign in
// when signed out). Opens upward since it lives at the bottom of the sidebar /
// mobile overlay. onNavigate lets the mobile overlay close when a link is used.
export default function AccountMenu({
  user,
  onNavigate,
}: {
  user: { id: string; email: string } | null;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeAll = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={ref} className="relative pc:w-[98%]">
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-4 right-4 mb-2 overflow-hidden rounded-md border border-muted bg-secondary py-1 shadow-[0px_2px_8px_rgba(0,0,0,0.3)]"
        >
          <ThemeToggle className={itemClass} />
          {user ? (
            <form action={logOut} onSubmit={closeAll}>
              <button type="submit" className={`${itemClass} cursor-pointer`}>
                <span>Sign out</span>
                <IoLogOutOutline />
              </button>
            </form>
          ) : (
            <Link href="/sign-in" className={itemClass} onClick={closeAll}>
              <span>Sign in</span>
              <IoLogInOutline />
            </Link>
          )}
        </div>
      )}

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${triggerClass} cursor-pointer`}
      >
        <IoPersonCircleOutline />
        <span className="min-w-0 flex-1 truncate" title={user?.email}>
          {user ? user.email : "Account"}
        </span>
        <IoChevronDown
          className={`!w-5 shrink-0 transition-transform duration-300 ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
}
