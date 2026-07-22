import Searchbar from "@/components/Searchbar";
import NavLink from "@/components/NavLink";
import { CATEGORIES, type Category } from "@/lib/tmdb";

const tabClass = "block no-underline transition-[color,scale] duration-300 hover:text-accent hover:scale-105";
const tabInactive = "text-muted";
const tabActive = "text-accent scale-105";

const LABELS: Record<Category, string> = {
  trending: "Trending",
  upcoming: "Upcoming",
  top_rated: "Top Rated",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex justify-around">
        {CATEGORIES.map((category) => (
          <NavLink
            key={category}
            href={`/home/${category}`}
            exact
            className={tabClass}
            inactiveClassName={tabInactive}
            activeClassName={tabActive}
          >
            {LABELS[category]}
          </NavLink>
        ))}
      </div>
      <Searchbar />
      {children}
    </>
  );
}
