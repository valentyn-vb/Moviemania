import Link from "next/link";
import Navigation from "./Navigation";
import MobileMenu from "./MobileMenu";
import AccountMenu from "./AccountMenu";
import SidebarToggle from "./SidebarToggle";
import { getUser } from "@/lib/auth/session";

export default async function Header() {
  const user = await getUser();

  return (
    // group-data-*: SidebarShell flips data-sidebar on the grid wrapper; the
    // collapsed sidebar hides only on pc, where the toggle exists.
    <header className="relative flex items-center justify-between bg-secondary py-8 pc:sticky pc:top-0 pc:flex pc:h-screen pc:flex-col pc:items-stretch pc:justify-start pc:overflow-y-auto group-data-[sidebar=collapsed]:pc:hidden">
      <div className="flex items-center justify-between pc:mb-16">
        <Link
          href="/"
          className="block cursor-pointer pl-8 font-heading text-l text-accent no-underline"
        >
          Moviemania
        </Link>
        <SidebarToggle className="pr-6" />
      </div>

      <MobileMenu user={user} />

      <div className="hidden pc:flex pc:flex-1 pc:flex-col pc:justify-between">
        <Navigation />
        <AccountMenu user={user} />
      </div>
    </header>
  );
}
