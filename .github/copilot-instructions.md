# Jajabor Trekkers Frontend — Rules

See [docs/DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md) for the current design tokens and UI rules.

## Stack
Next.js (App Router), TypeScript (strict), Tailwind CSS, shadcn/ui, TanStack Query, TanStack Form, Zod, Better Auth client.

## Backend contract
- The backend is a separate repo. Its API docs are at <BACKEND_URL>/api/docs and the raw spec at /api/docs.json. Treat that spec as the source of truth for URLs, bodies and responses; never guess a field name.
- Success response: { success: true, message, data, meta? }. Error response: { success: false, message, errors? }.
- API base path: /api/v1. Auth routes: /api/auth/*.
- Money values are numbers in Taka (BDT). Format with Intl.NumberFormat ("en-BD", currency BDT), never string concatenation.
- Browser requests go to the SAME origin under /api/* and Next.js rewrites proxy them to the backend (see next.config). Never hardcode the backend URL in components. Always send credentials (cookies).

## Architecture
- src/app: routes only (layouts, pages, loading.tsx, error.tsx). Keep pages thin.
- src/components/ui: shadcn components (do not edit casually).
- src/components/<feature>: feature components (destinations, trips, expenses, ...).
- src/lib/api: one fetch wrapper (credentials: "include", throws a typed ApiError built from the error envelope) and one file per backend module with typed functions.
- src/hooks: TanStack Query hooks per feature (useDestinations, useTrip, ...). Components never call fetch directly.
- src/lib/validation: Zod schemas for forms; mirror the backend rules.
- src/types/api.d.ts is GENERATED from the backend spec (npm run api:types). Do not edit it by hand.

## Conventions
- Server Components by default; add "use client" only when needed (state, effects, handlers).
- Public SEO pages (home, destinations list, destination details) fetch on the server without cookies. Logged-in pages (my trips, trip details, admin) use TanStack Query on the client.
- Every data screen has loading, empty and error states. Use skeletons, not spinners, for lists.
- Forms: TanStack Form + Zod. Show field errors from the backend `errors` array.
- Invalidate the right query keys after every mutation; define query keys in one place per feature.
- Mobile first; every page must work at 360px width. Large touch targets for buttons.
- Accessibility: labels on inputs, alt text on images, visible focus, no color-only meaning.
- No `any`. Named exports for components/hooks. No secrets in the repo; only NEXT_PUBLIC_* values are readable in the browser. Keep .env.example updated.
- All user-facing text goes through a single place (src/messages) so Bangla and English can be added later; do not scatter hardcoded strings in deep components.
- Do not install a package without telling me why.

## Next.js version warning
This project uses Next.js 16 with `cacheComponents` and `partialPrefetching` enabled in next.config.ts. APIs and conventions differ from older versions. Before writing routing, data fetching or caching code, read the matching guide in `node_modules/next/dist/docs/` (see also AGENTS.md). With cacheComponents, data fetched in Server Components is dynamic by default: wrap it in `<Suspense>` or cache it explicitly with `use cache`. Route params and cookies are async.
