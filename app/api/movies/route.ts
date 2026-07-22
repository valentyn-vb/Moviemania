import { getMoviesByCategory, searchMovies, isCategory } from "@/lib/tmdb";

// GET /api/movies?category=trending&page=2  OR  ?query=batman&page=2
// Runs server-side (key stays hidden), CDN-cacheable for category reads.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const query = searchParams.get("query");
  const category = searchParams.get("category");

  try {
    if (query) {
      const data = await searchMovies(query, page);
      return Response.json(data);
    }
    if (category && isCategory(category)) {
      const data = await getMoviesByCategory(category, page);
      return Response.json(data, {
        headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
      });
    }
    return Response.json({ error: "Missing or invalid category/query" }, { status: 400 });
  } catch {
    return Response.json({ error: "Upstream request failed" }, { status: 502 });
  }
}
