# Moviemania

A movie and TV browser — a curated home page, filterable listings, title and
person details, and a per-account collection — powered by
[TMDB](https://www.themoviedb.org/).

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and
**Tailwind CSS v4**. Movie data is fetched in React Server Components / a route
handler / a server action, so the TMDB API key stays server-side.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (copy `.env.example`) and fill in all three values:

   ```bash
   TMDB_API_KEY=your_tmdb_api_key_here
   DATABASE_URL=postgres://...
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

   Get a TMDB key at https://www.themoviedb.org/settings/api. Sign-in and the
   collection need the database and session secret; browsing needs only the key.

3. Start Postgres and apply migrations:

   ```bash
   npm run db:up
   npm run db:migrate
   ```

4. Run the dev server:

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
  - `/` — home page: a trending hero, three curated rails (trending today, in
    theatres, top rated) and the cast of this week's trending films. Every
    section streams under its own `Suspense` and fails soft.
  - `movies` / `tv` — browse and search. Filter state lives entirely in the
    search params (see `lib/filters.ts`); `?query=` switches to search.
  - `movies/[movieId]` and `tv/[tvId]` — details in the layout; `cast` and
    `reviews` render into it (data deduped across them via React `cache()`).
  - `person/[personId]` — bio and filmography.
  - `sign-in` / `sign-up` — session auth (jose-signed cookie, bcrypt hashes).
  - `watchlist` — auth-gated collection with `watched` and `favorites` tabs,
    stored in Postgres and read through server actions in `watchlist/actions.ts`.
  - `api/movies` — GET route handler backing infinite scroll.
- `lib/tmdb.ts` — server-only TMDB data layer (`import "server-only"`), 1h ISR.
- `lib/db/` — Drizzle schema, migrations and the postgres.js client.
- `components/` — UI, mostly server components; the client ones are marked
  `"use client"` (menus, filters, search, forms, infinite scroll, theme).

## Deploying to Vercel

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com/new).
2. Add the `TMDB_API_KEY` environment variable in the Vercel project settings.
3. Vercel auto-deploys on push — no workflow file needed.

> Security note: rotate the TMDB key before launch — the previous hardcoded key
> was shipped publicly in the old build and is in git history.
