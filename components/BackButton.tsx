"use client";

import { useRouter } from "next/navigation";
import { MdArrowBackIosNew } from "react-icons/md";

export default function BackButton() {
  const router = useRouter();

  const goBack = () => {
    // Prefer real history; fall back to the default listing on a cold entry.
    if (window.history.length > 1) router.back();
    else router.push("/home/trending");
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="mb-8 flex items-center text-accent transition-[font-size] duration-300 hover:text-[28px]"
    >
      <MdArrowBackIosNew />
      Back to Movies
    </button>
  );
}
