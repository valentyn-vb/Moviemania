import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-4 text-light">
      <p className="mb-4 font-normal">
        Ooops... The page you are looking for wasn&apos;t found
      </p>
      <Link href="/home/trending" className="text-accent">
        Back to Movies
      </Link>
    </div>
  );
}
