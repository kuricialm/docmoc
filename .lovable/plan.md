

## Plan

### 1. Fix `.gitignore` — add `data/` exclusion
Add `data/` to `.gitignore` so uploaded files, the SQLite database, and any runtime data are never committed to Git.

### 2. Remove already-tracked `data/` from Git
Run `git rm -r --cached data` equivalent — since we can't run git commands directly, the `.gitignore` addition will prevent future tracking, and I'll note the one-time cleanup command you need to run locally.

### 3. Update `.dockerignore` — confirm `data/` is excluded
The current `.dockerignore` doesn't list `data/` either, so Docker builds could copy runtime data into images. Add it there too.

### 4. Deliver updated prompts
Add a line to both prompts about excluding `data/` from version control.

---

### Files to modify
- `.gitignore` — add `data/` entry
- `.dockerignore` — add `data/` entry

### Manual step (you run once locally)
```bash
git rm -r --cached data
git commit -m "Stop tracking runtime data directory"
git push
```

### Updated Prompt 1 — Rebuild

```text
Rebuild [App Name] without Supabase and without any hosted backend dependency.

I want [App Name] to be designed for a minimal self-hosted architecture
from the start. Focus on the frontend UI, UX, pages, and complete app
flows, but do not build the app around Supabase auth, Supabase database,
or Supabase storage.

Keep the architecture suitable for a simple self-hosted backend (Express +
SQLite) with local file storage. Do not introduce managed backend services
or platform-specific infrastructure.

The app must still feel fully functional in structure and flow, but the
implementation should stay portable and easy to connect to a minimal
self-hosted backend later.

Prioritize:
- premium minimal UI/UX
- complete screens and flows
- no emojis
- no fake controls

Backend & Auth requirements (critical for Lovable preview + Docker):
- Use server.cjs (CommonJS) for the backend entry point.
- Cookie-based sessions (httpOnly, path: '/').
- Add app.set('trust proxy', 1) in Express.
- Cookies must be proxy-aware: detect secure context via req.secure OR
  x-forwarded-proto header. Use sameSite:'none' + secure:true when HTTPS
  detected, fall back to sameSite:'lax' for plain HTTP.
- Vite dev proxy must forward x-forwarded-proto:'https' header to the
  backend so cookies work correctly in Lovable's preview iframe.
- After login, verify session with /auth/me before treating user as
  authenticated. If verification fails, show a clear error instead of
  entering a half-logged-in state.
- Auto-start the backend in dev via a Vite plugin (configureServer hook).
- Support VITE_USE_EXTERNAL_BACKEND=true to skip auto-starting the backend.

Data directory:
- All runtime data (database, uploads) must go in a data/ directory.
- Add data/ to both .gitignore and .dockerignore so runtime files are
  never committed to the repo or baked into Docker images.

Do not use Supabase.
Do not assume a hosted backend.
Keep everything portable and simple.
```

### Updated Prompt 2 — Dockerize

```text
Dockerize this project based on its current working codebase.

Requirements:
- Generate a production-ready Dockerfile
- Generate docker-compose.yml with volume mount for persistent data
- Generate .dockerignore (must include data/ to exclude runtime files)
- Confirm .gitignore includes data/ so uploads and database are never
  committed to the repo
- Use npm install, not npm ci, in the Dockerfile
- Make sure server.cjs is used (CommonJS) for the Express backend
- Make sure Express, better-sqlite3, and all runtime deps are in
  package.json dependencies (not devDependencies)
- Keep the setup minimal, clean, and working
- Do not reintroduce Supabase or any hosted backend dependency
- Do not restructure the app unnecessarily
- Do not change working code unless required for Docker
- The cookie/session system must remain proxy-aware (sameSite/secure
  detection already in server.cjs) so it works behind reverse proxies

After generating the files, briefly explain the install, build, and
run commands used.
```

