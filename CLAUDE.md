# AI on the Ballot

Nonpartisan candidate tracker — documents U.S. congressional candidates' public AI governance positions.

## Stack
- Next.js 16 (App Router) + TypeScript
- Supabase (PostgreSQL) for data
- Tailwind 4 + CSS custom properties for styling
- Zustand for client state
- react-simple-maps for interactive US map
- Vercel for deployment

## Project Structure
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components organized by feature (layout/, map/, race/, candidate/, shared/)
- `src/lib/supabase/` — Supabase client setup (browser + server)
- `src/lib/queries/` — Server-side data fetching functions
- `src/lib/utils/` — Pure utility functions (slugs, states, stance display)
- `src/stores/` — Zustand stores
- `src/types/` — TypeScript types (database.ts mirrors schema, domain.ts for app-level)
- `supabase/migrations/` — SQL migration files
- `scripts/` — Data import scripts

## Key Conventions
- **Path alias:** `@/*` maps to `./src/*`
- **Fonts:** Inter (body), Crimson Text (display headings), JetBrains Mono (data)
- **Design tokens:** CSS custom properties in `globals.css`, bridged to Tailwind via `@theme inline`
- **Party colors:** Red/blue used ONLY in PartyBadge component. Site chrome uses teal/indigo/amber palette.
- **Server Components by default.** Use `'use client'` only when needed (interactivity, Zustand, event handlers).
- **ISR:** Data pages use `export const revalidate = 1800` (30 min).
- **Slugs:** states = lowercase full name (`texas`), races = `{abbr}-{chamber}-{district?}-{year}`, candidates = `{first}-{last}-{abbr}`

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check

## Data Model
6 tables: candidates, races, issues, positions, legislative_activity, corrections_log
Plus junction table: race_candidates

## Nonpartisan Design Rules
- All candidates receive identical visual treatment regardless of party
- Default sort: alphabetical by last name
- No candidate is elevated, featured, or demoted
- Stance indicators use color + shape + text (never color alone) for accessibility
