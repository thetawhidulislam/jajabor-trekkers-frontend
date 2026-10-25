# Frontend routes -> backend modules

| Route | Access | Backend |
|---|---|---|
| /login, /signup | public | /api/auth/* |
| /destinations | public (server fetch) | GET /api/v1/destinations, /categories |
| /destinations/[slug] | public (server fetch) | GET /destinations/:slug, /destinations/:slug/reviews |
| /trips, /trips/new | logged in | /trips |
| /trips/[tripId] (+ itinerary, packing, expenses, members) | trip member | /trips/:id, /itinerary, /packing, /expenses, /balances, /settlements, /members |
| /invitations | logged in | /trips/invitations |
| /profile | logged in | /users/me |
| /admin/** | ADMIN only | /admin/* |

Remember: a non-member opening a trip gets 404 from the backend; show a "Trip not found" page, not a login error.
Route groups (auth), (public), (app) do not change URLs; add a layout.tsx to each later (navbar, auth guard).
