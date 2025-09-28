Frontend overview (one-line)
A Vite + React + TypeScript single-page app (Tailwind CSS) that provides: dashboard + charts, a searchable services catalog, service cards, bookmarks (local + server-backed), and a profile/auth flow.

High-level features (what the frontend must support)
Responsive app shell with navigation (Dashboard, Search, Bookmarks, Profile).
Searchable, filterable list of services (city, category, price range, rating, text query).
Service card UI with details, rating, price, image(s), and a bookmark toggle.
Bookmarks page showing saved services in the same card layout.
Local persistence of bookmarks for unauthenticated users (local_bookmarks).
Server-backed bookmarks for authenticated users (sync/merge logic).
Authentication UI: Register, Login, token storage (demo uses localStorage).
Profile view + edit page (protected).
Small charts on Dashboard (cost comparison, expense breakdown) using demo data.
Accessibility, error handling, mobile-first responsive layout.
App structure & routing
src/main.tsx — mounts app, Router, and global providers (AuthProvider recommended).
src/App.tsx — routes:
/ → Dashboard
/search → ServiceSearch
/services/:id → ServiceDetail (optional)
/bookmarks → Bookmarks
/profile → Profile (protected)
/auth/login, /auth/register → auth pages
Use lazy loading for heavy pages to speed initial load.
Global state & utilities
Auth context/provider (AuthContext) exposes: user, token, login(), logout(), isAuthenticated.
API helper src/utils/api.ts:
apiFetch(path, opts) attaches Authorization: Bearer <token> if available and returns structured JSON or throws an ApiError.
Local storage keys:
local_bookmarks — Array<string> (service_id)
auth_token — JWT token (demo only)
Debounce utility (300ms) for search input.
Component catalog (each “little box” described)
Note: for each component I give Purpose, Props/state, API calls, UI states, and Edge cases.

Layout.tsx

Purpose: app shell (header, nav, footer).
Props: children
State: reads AuthContext to show login / user menu.
Notes: responsive nav, focus management for accessibility.
ServiceSearch.tsx

Purpose: search/filter UI and service card list.
Local state:
q (string) — debounced
filters: city, category, minPrice, maxPrice, minRating
sort, page, limit
loading, error, data[]
localBookmarks: Set<string> (from local_bookmarks)
serverBookmarkMap: Record<service_id, bookmark_id> (when logged in)
API:
GET /api/services?q=&city=&category=&minPrice=&maxPrice=&minRating=&sort=&page=&limit=
If logged in, fetch /api/bookmarks on mount to build serverBookmarkMap.
UI states: loading spinner, empty list (with CTA), paginated controls, inline error toast.
Actions:
bookmark toggle:
If logged out: update local_bookmarks in localStorage and local set.
If logged in & service not bookmarked: POST /api/bookmarks → store returned bookmark id in serverBookmarkMap.
If logged in & service bookmarked: DELETE /api/bookmarks/:bookmarkId → remove from map.
On click card → navigate to /services/:id.
Edge cases:
Double-tap add (handle idempotency / show loading on button).
Offline: queue local action and show indicator.
ServiceCard (used by list & bookmarks)

Props: service, isBookmarked (bool), onToggleBookmark()
Renders: image, title, city, price range, rating, bookmark icon button.
Accessibility: bookmark button with aria-pressed and label.
ServiceDetail.tsx (optional)

Purpose: single service view, full description, images, map/address.
API: GET /api/services/:id
Actions: bookmark toggle (as above).
Bookmarks.tsx

Purpose: show saved services in card layout.
Behavior:
Logged out: read local_bookmarks → map ids to service objects (from mockServices or fetch /api/services/:id).
Logged in: GET /api/bookmarks → for each record either get embedded service snapshot or fetch service detail.
UI: empty state with suggestion to browse/search.
Edge cases: bookmark id used to delete when logged in.
Profile.tsx

Purpose: view/edit profile.
API:
GET /api/profile
PUT /api/profile body { name, email }
Validation: client-side email format, required name.
UX: success toast and optimistic field disabling during save.
Auth pages (Login, Register)

Login:
POST /api/login → receive { token, user }.
On success: set auth token in AuthContext; optionally sync local_bookmarks with server.
Register:
POST /api/register → { token, user } (auto-login).
Dashboard + chart components

Accept props for datasets and render charts (bar/pie).
If backend present, fetch /api/dashboard/summary.
Data shapes (canonical)
Service

{ id: string, name: string, city: string, category: string, description?: string, price_min?: number, price_max?: number, rating?: number, images?: string[], metadata?: object, created_at?: string }
Bookmark (server)

{ id: number, user_id: number, service_id: string, meta?: object, created_at: string }
User

{ id: number, name: string, email: string }
API error

{ error: { code: string, message: string } }
Bookmark behavior & sync strategy
Offline / logged-out:
Maintain local_bookmarks (Array<string>). UI reads this for bookmarked state.
Logged-in:
Server is authoritative. When user logs in:
Option A (simple): don't auto-merge; keep server list only.
Option B (recommended): fetch server bookmarks, find local_bookmarks not present, call either POST /api/bookmarks per id or a batch endpoint to create them, then clear local_bookmarks (or keep as cached copy). Handle conflicts via unique constraint.
Implementation notes:
Keep bookmark_map (service_id → bookmark_id) in memory for quick DELETE mapping.
Backend should have UNIQUE(user_id, service_id).
UX & accessibility
Keyboard navigation for cards and bookmark buttons.
Screen-reader labels for interactive controls.
Announce state changes (toast/ARIA-live) for bookmark add/remove and form submissions.
Mobile-first: cards stack, filters collapse into a modal/accordion on small screens.
Network UX (performance & reliability)
Debounce search input (300ms).
Paginate results; server returns meta.total.
Optimistic UI for bookmark toggle (apply UI change immediately, revert on server error).
Cache service list pages in memory to support back/forward navigation without re-fetch.
Testing suggestions (what to test)
Unit: ServiceCard, bookmark toggle logic, utils (debounce, api wrapper).
Integration: ServiceSearch fetch + filters producing correct API calls.
End-to-end: Login → bookmark sync → ensure server record created.
Accessibility checks: keyboard, ARIA labels, color contrast.
