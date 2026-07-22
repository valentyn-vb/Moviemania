"use client";

import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import Navigation from "./Navigation";

export default function MobileMenu() {
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
        <div className="fixed inset-0 z-[100000] h-screen w-screen bg-secondary pl-4 pt-8 text-[40px] font-medium">
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="mb-8 text-accent"
          >
            <IoClose />
          </button>
          <Navigation onNavigate={close} />
        </div>
      )}
    </div>
  );
}
