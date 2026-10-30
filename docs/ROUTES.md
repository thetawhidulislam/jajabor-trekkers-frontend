# Frontend routes -> backend modules

| Route | Access | Backend |
|---|---|---|
| /login, /signup | public | /api/auth/* |
| /destinations | public (server fetch) | GET /api/v1/destinations, /categories |
| /destinations/[slug] | public (server fetch) | GET /destinations/:slug, /destinations/:slug/reviews |
| /trips, /trips/new | logged in | /trips |
| /trips/[tripId] (+ itinerary, packing, members) | trip member | /trips/:id, /itinerary, /packing, /members |
| /trips/[tripId]/expenses | trip member | /trips/:tripId/expenses, /balances, /settlements |
| /invitations | logged in | /trips/invitations |
| /profile | logged in | /users/me |
| /admin | ADMIN only (others get 404) | No aggregate endpoint; links to admin sections |
| /admin/destinations (+ new/edit) | ADMIN only (others get 404) | `GET/POST /api/v1/admin/destinations`, `GET/PATCH/DELETE /api/v1/admin/destinations/{id}`, `PATCH /api/v1/admin/destinations/{id}/status`, `PATCH /api/v1/admin/destinations/{id}/featured`; signed direct Cloudinary uploads use `POST /api/v1/uploads/signature` |
| /admin/categories | ADMIN only (others get 404) | `GET /api/v1/categories`, `POST /api/v1/admin/categories`, `PATCH/DELETE /api/v1/admin/categories/{id}` |
| /admin/reviews | ADMIN only (others get 404) | `GET /api/v1/admin/reviews`, `PATCH /api/v1/admin/reviews/{id}/visibility`, `DELETE /api/v1/admin/reviews/{id}` |

Destination creation always starts as a draft. Publishing uses the status endpoint and the backend validates required publish fields; only drafts can be deleted, so other destinations must be archived.

Remember: a non-member opening a trip gets 404 from the backend; show a "Trip not found" page, not a login error.
Route groups (auth), (public), and (app) do not change URLs. The `/admin` layout restricts the admin routes to administrators.
