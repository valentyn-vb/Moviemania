import { notFound } from "next/navigation";
import Searchbar from "@/components/Searchbar";
import NavLink from "@/components/NavLink";
import { getCategories, isMediaType } from "@/lib/tmdb";

const tabClass =
  "block no-underline transition-[color,scale] duration-300 hover:text-accent hover:scale-105";
const tabInactive = "text-muted";
const tabActive = "text-accent scale-105";

// Display labels for every category key across both media types.
const LABELS: Record<string, string> = {
  trending: "Trending",
  upcoming: "Upcoming",
  top_rated: "Top Rated",
  popular: "Popular",
};

export default async function HomeLayout({
  params,
  children,
}: {
  params: Promise<{ mediaType: string }>;
  children: React.ReactNode;
}) {
  const { mediaType } = await params;
  if (!isMediaType(mediaType)) notFound();

  return (
    <>
      <div className="flex justify-around">
        {getCategories(mediaType).map((category) => (
          <NavLink
            key={category}
            href={`/home/${mediaType}/${category}`}
            exact
            className={tabClass}
            inactiveClassName={tabInactive}
            activeClassName={tabActive}
          >
            {LABELS[category] ?? category}
          </NavLink>
        ))}
      </div>
      <Searchbar mediaType={mediaType} />
      {children}
    </>
  );
}
