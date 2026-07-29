import { discoverTitles, searchTitles, isMediaType } from "@/lib/tmdb";
import { parseFilters } from "@/lib/filters";

// GET /api/movies?media=movie&sort=vote_average.desc&genre=28,878&page=2
//  OR /api/movies?media=tv&query=batman&page=2
//
// Backs MovieList's infinite scroll. Filter params are parsed with the same
// parseFilters() the page uses, so page 2 is guaranteed to match page 1.
// Runs server-side (key stays hidden), CDN-cacheable for browse reads.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const query = searchParams.get("query");
  const media = searchParams.get("media") ?? "movie";

  if (!isMediaType(media)) {
    return Response.json({ error: "Invalid media type" }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1) {
    return Response.json({ error: "Invalid page" }, { status: 400 });
  }

  try {
    if (query) {
      const data = await searchTitles(media, query, page);
      return Response.json(data);
    }
    const data = await discoverTitles(media, parseFilters(media, searchParams), page);
    return Response.json(data, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
    });
  } catch {
    return Response.json({ error: "Upstream request failed" }, { status: 502 });
  }
}
