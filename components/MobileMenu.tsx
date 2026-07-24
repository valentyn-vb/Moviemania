"use client";

import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import Navigation from "./Navigation";
import AccountMenu from "./AccountMenu";

export default function MobileMenu({
  user,
}: {
  user: { id: string; email: string } | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <div className="pc:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
        className="pr-4"
      >
        <GiHamburgerMenu className="h-auto w-[33px] fill-accent" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex h-screen w-screen flex-col bg-secondary pl-4 pt-8 text-[40px] font-medium">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="mb-8 text-accent"
          >
            <IoClose />
          </button>
          <Navigation onNavigate={close} />
          <div className="mb-8 mt-auto text-[24px]">
            <AccountMenu user={user} onNavigate={close} />
          </div>
        </div>
      )}
    </div>
  );
}
