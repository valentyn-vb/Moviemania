import { redirect } from "next/navigation";

// The "Movies" nav link points at /home/movie; a bare /home lands on the
// default movie tab.
export default function HomePage() {
  redirect("/home/movie/trending");
}
