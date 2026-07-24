import { getListing, searchTitles, isCategory, isMediaType } from "@/lib/tmdb";

// GET /api/movies?media=movie&category=trending&page=2  OR  ?media=tv&query=batman&page=2
// Runs server-side (key stays hidden), CDN-cacheable for category reads.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const query = searchParams.get("query");
  const category = searchParams.get("category");
  const media = searchParams.get("media") ?? "movie";

  if (!isMediaType(media)) {
    return Response.json({ error: "Invalid media type" }, { status: 400 });
  }

  try {
    if (query) {
      const data = await searchTitles(media, query, page);
      return Response.json(data);
    }
    if (category && isCategory(media, category)) {
      const data = await getListing(media, category, page);
      return Response.json(data, {
        headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
      });
    }
    return Response.json({ error: "Missing or invalid category/query" }, { status: 400 });
  } catch {
    return Response.json({ error: "Upstream request failed" }, { status: 502 });
  }
}
