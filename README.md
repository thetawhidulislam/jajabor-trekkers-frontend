# Jajabor Trekkers — Frontend

Next.js 16 (App Router) + TypeScript + Tailwind CSS + TanStack Query/Form + Zod + Better Auth client.

## Run
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `BACKEND_URL` and `NEXT_PUBLIC_SITE_URL` for your environment (local defaults are provided)
3. Start the backend, then `npm run dev` and open http://localhost:3000

## How it talks to the backend
The browser only calls same-origin `/api/*`. `next.config.ts` rewrites it to `BACKEND_URL`, so there is no CORS and the login cookie stays first-party. The backend's `CLIENT_URL` must equal this app's public URL.

## Scripts
- `npm run api:types` — generate `src/types/api.d.ts` from the backend OpenAPI spec (backend must be running)
- `npm run typecheck`, `npm run lint`, `npm run build`

## Structure
See `docs/ROUTES.md` and `.github/copilot-instructions.md`.
