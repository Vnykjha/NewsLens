# NewsLens

AI-native news intelligence platform that helps users understand a news story — credibility analysis, multiple perspectives, contextual summaries, citations, and community notes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router
- API: Express 5 (shared `artifacts/api-server`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Fonts: Inter (all weights) + Playfair Display (400/700) via `@expo-google-fonts`

## Where things live

- **Mobile app:** `artifacts/newslens/` — Expo Router, 5-tab layout
- **Screens:** `artifacts/newslens/app/(tabs)/` — Home, Explore, Saved, Community, Profile
- **Analysis screen:** `artifacts/newslens/app/analysis/[id].tsx` — the core AI intelligence report
- **Mock data:** `artifacts/newslens/lib/mockData.ts` — articles, folders, community data
- **Mock analysis:** `artifacts/newslens/lib/mockAnalysis.ts` — full analysis reports per article
- **State:** `artifacts/newslens/context/AppContext.tsx` — saved articles, folders, votes (AsyncStorage)
- **Colors:** `artifacts/newslens/constants/colors.ts` — newspaper-inspired palette (black/white/red)
- **API server:** `artifacts/api-server/src/routes/` — Express routes
- **API contract:** `lib/api-spec/openapi.yaml` — OpenAPI source of truth

## Architecture decisions

- **Frontend-only first build:** AsyncStorage for all persistence (saved articles, folders, reading history, votes). No database provisioned yet.
- **Mock AI analysis:** Rich, detailed mock analysis data in `lib/mockAnalysis.ts` per article ID, with a fallback generator for any unknown article. Gemini integration pending account upgrade.
- **Newspaper aesthetic:** White background, black typography, red (#C41E3A) accents. Inter for body, Playfair Display available for serif headings.
- **5-tab navigation:** Home, Explore, Saved, Community, Profile — using NativeTabs (iOS 26+ liquid glass) with ClassicTabs fallback.
- **Analysis screen** is the flagship: TL;DR, Context, Key Claims, Stakeholders, Risks/Opportunities, Timeline, Credibility Analysis, Multi-Perspective (Supporting/Alternative/Contradictory), Citations, Media Authenticity, Community Notes.

## Product

- **Home:** News feed with trending + latest articles, category filters, credibility scores on every card
- **Explore:** Search by keyword/publisher/topic, topic grid, publisher browser
- **Saved:** Folder-based article organization with AsyncStorage persistence
- **Community:** Upvote/downvote articles, community notes, sorted feed
- **Profile:** Topic preferences, notification settings, reading history, subscription upsell
- **Analysis:** Full AI intelligence report with 12 sections, multi-perspective tabs, credibility meter

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Gemini AI integration requires account upgrade — currently using rich mock analysis data
- Playfair Display is installed (`@expo-google-fonts/playfair-display`) but fonts are `PlayfairDisplay_400Regular` and `PlayfairDisplay_700Bold` — use these exact names
- Analysis screen uses `app/analysis/[id].tsx` — navigate via `router.push(\`/analysis/${article.id}\`)`
- `useColors()` returns `colors.credibilityHigh/Medium/Low` for score-based color logic

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile-specific patterns (safe area, keyboard, fonts)
