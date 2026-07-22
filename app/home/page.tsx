import { redirect } from "next/navigation";

// The "Home" nav link points at /home; send it to the default tab.
export default function HomePage() {
  redirect("/home/trending");
}
