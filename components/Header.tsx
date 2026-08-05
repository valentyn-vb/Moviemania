import Link from "next/link";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";
import AccountMenu from "./AccountMenu";
import { getUser } from "@/lib/auth/session";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="relative flex items-center justify-between bg-secondary py-8 pc:sticky pc:top-0 pc:flex pc:h-screen pc:flex-col pc:items-stretch pc:justify-start pc:overflow-y-auto">
      <Link
        href="/"
        className="block cursor-pointer pl-8 font-heading text-l text-accent no-underline pc:mb-16"
      >
        Moviemania
      </Link>

      <MobileMenu user={user} />

      <div className="hidden pc:flex pc:flex-1 pc:flex-col pc:justify-between">
        <Navigation />
        <AccountMenu user={user} />
      </div>
    </header>
  );
}
