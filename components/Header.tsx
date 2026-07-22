import Link from "next/link";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header className="relative flex items-center justify-between bg-secondary py-8 pc:block">
      <Link
        href="/home/trending"
        className="block cursor-pointer pl-8 font-heading text-l text-accent no-underline pc:mb-16"
      >
        Moviemania
      </Link>

      <MobileMenu />

      <div className="hidden pc:block">
        <Navigation />
      </div>
    </header>
  );
}
