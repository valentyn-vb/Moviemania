"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbSearch } from "react-icons/tb";
import type { MediaType } from "@/lib/types";

export default function Searchbar({
  defaultQuery = "",
  mediaType = "movie",
}: {
  defaultQuery?: string;
  mediaType?: MediaType;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultQuery);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    const base = mediaType === "tv" ? "/tv" : "/movies";
    router.push(`${base}?query=${encodeURIComponent(q)}`);
  };

  return (
    <div className="mt-8 px-8 text-center">
      <form
        onSubmit={onSubmit}
        className="relative inline-flex w-full justify-center px-4 pc:inline"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          placeholder={mediaType === "tv" ? "Search for TV shows" : "Search for movies"}
          className="w-full max-w-[600px] rounded-[30px] border-none bg-secondary py-4 pl-8 pr-[75px] text-muted shadow-[0px_1px_2px_rgba(0,0,0,0.2)] outline-none placeholder:text-[18px]"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-4 h-16 w-16 rounded-[30px] bg-muted opacity-60 outline-none transition-opacity duration-300 hover:opacity-100"
        >
          <TbSearch className="mx-auto h-auto w-5" />
        </button>
      </form>
    </div>
  );
}
