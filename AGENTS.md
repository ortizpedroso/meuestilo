# AGENTS.md

## Cursor Cloud specific instructions

### What this project is
Single front-end-only SPA — "Meu Stilo", a Portuguese salon/barbershop booking & management app.
Stack: React 19 + TypeScript + Vite 6 + Tailwind CSS 4. Package manager: **npm**.
There is **no backend, database, or API server**. All state persists in the browser's `localStorage`
(see `src/services/storage.ts`), seeded from `src/data/initialData.ts`. `express`, `dotenv`, and
`@google/genai` are listed in `package.json` but are not used by the app; no env vars are required to run it.

### Running / building / linting
Standard scripts are in `package.json`; nothing custom is required:
- Dev server: `npm run dev` → serves at `http://localhost:3000` (`--host=0.0.0.0`).
- Lint / typecheck: `npm run lint` (runs `tsc --noEmit`).
- Production build: `npm run build`; preview a build with `npm run preview`.

### Non-obvious caveats
- The Vite production build prints a harmless PostCSS warning about an `@import` (Google Fonts) in
  `src/index.css` needing to precede other rules. It does not fail the build.
- HMR is controlled by `DISABLE_HMR` in `vite.config.ts`. It is ON by default (HMR enabled). If you edit
  files and then `git checkout`/revert them, the dev server can keep serving a **stale transformed module**;
  restart the dev server (and optionally `rm -rf node_modules/.vite`) to get a clean state before testing.
- Because all data lives in `localStorage`, tests that mutate data leave state behind. The app exposes a
  "reset to defaults" action (admin panel) that clears the `meustilo_*_v1` keys.

### Known pre-existing bug (blocks interactive end-to-end flows)
As of the current commit, any interaction that writes to storage crashes the app with
`Maximum call stack size exceeded` / "Too many re-renders". Root cause is an infinite loop in
`src/services/storage.ts` + `src/App.tsx`:
`getCustomers()` → `syncCustomersFromAppointments()` → `setItem()` (which always dispatches the
`meustilo_storage_update` event) → `App.tsx` `handleStorageUpdate` → `getCustomers()` → … .
The landing page renders fine, but opening the booking modal / submitting a review / using the admin panel
crashes. This is application code, not an environment issue — do not attempt to "fix" it as part of
environment setup. A minimal fix would be to stop `getCustomers()` from writing on read (or make the
customer-sync `setItem` not dispatch the update event).
