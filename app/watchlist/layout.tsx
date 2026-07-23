import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import NavLink from "@/components/NavLink";
import Searchbar from "@/components/Searchbar";

const tabClass =
  "block no-underline transition-[color,scale] duration-300 hover:text-accent hover:scale-105";
const tabInactive = "text-muted";
const tabActive = "text-accent scale-105";

const TABS = [
  { href: "/watchlist", label: "Watch List" },
  { href: "/watchlist/watched", label: "Watched" },
  { href: "/watchlist/favorites", label: "Favorites" },
];

export default async function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <>
      <div className="flex justify-around">
        {TABS.map(({ href, label }) => (
          <NavLink
            key={href}
            href={href}
            exact
            className={tabClass}
            inactiveClassName={tabInactive}
            activeClassName={tabActive}
          >
            {label}
          </NavLink>
        ))}
      </div>
      <Searchbar />
      {children}
    </>
  );
}
