# Moviemania

A movie browser (trending / upcoming / top-rated, search, details, and a
localStorage watchlist) powered by [TMDB](https://www.themoviedb.org/).

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and
**Tailwind CSS v4**. Movie data is fetched in React Server Components / a route
handler / a server action, so the TMDB API key stays server-side.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (copy `.env.example`) and set your TMDB v3 API key:

   ```bash
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

   Get a key at https://www.themoviedb.org/settings/api.

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit

## Architecture

- `app/` — App Router routes.
  - `home/[category]` — trending / upcoming / top_rated tabs (SSG + ISR, 1h revalidate).
  - `movies` — search results (`?query=`).
  - `movies/[movieId]` — details in the layout; `cast` and `reviews` render into it
    (data deduped across them via React `cache()`).
  - `watchlist` — client page; reads localStorage ids and fetches via a server action.
  - `api/movies` — GET route handler backing infinite scroll.
- `lib/tmdb.ts` — server-only TMDB data layer (`import "server-only"`).
- `lib/watchlist.ts` — client watchlist store (`useSyncExternalStore` over localStorage).
- `components/` — UI. Only `MovieList`, `Searchbar`, `Header`'s menu, `NavLink`,
  `WatchlistButton`, `BackButton`, and `BackToTopButton` are client components.

## Deploying to Vercel

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com/new).
2. Add the `TMDB_API_KEY` environment variable in the Vercel project settings.
3. Vercel auto-deploys on push — no workflow file needed.

> Security note: rotate the TMDB key before launch — the previous hardcoded key
> was shipped publicly in the old build and is in git history.
