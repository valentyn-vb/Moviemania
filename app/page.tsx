import { redirect } from "next/navigation";

// Movies are the default landing view; /movies is the canonical browse route.
export default function RootPage() {
  redirect("/movies");
}
