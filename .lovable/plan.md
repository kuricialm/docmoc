

# Plan: Add Express Backend to Docmoc (Revised)

## Architecture

```text
┌──────────────────────────────┐     ┌──────────────────────────────┐
│  React SPA (Vite build)      │     │  Express Backend (server.cjs)│
│                              │     │                              │
│  src/lib/api.ts ─── fetch ──────►  │  /api/auth/*                 │
│  (HTTP client)               │     │  /api/documents/*            │
│                              │     │  /api/tags/*                 │
│                              │     │  /api/notes/*                │
│                              │     │  /api/users/*                │
│                              │     │  /api/settings/*             │
│                              │     │  /api/shared/*               │
│                              │     │                              │
│                              │     │  SQLite: ./data/docmoc.db    │
│                              │     │  Files:  ./data/uploads/     │
└──────────────────────────────┘     └──────────────────────────────┘
```

## Key Design Decisions

### File storage paths
Files stored as `DATA_DIR/uploads/{userId}/{docId}.{ext}`. Original filename kept only in SQLite `documents.name`. No user-controlled strings in filesystem paths.

### Seed admin
Configurable via environment variables:
- `ADMIN_EMAIL` (default: `admin@docmoc.local`)
- `ADMIN_PASSWORD` (default: `admin`)
- Only created on first run when no users exist in the database.

### Sessions
HTTP-only cookies. The server sets a `session` cookie with `httpOnly: true, sameSite: 'lax', path: '/'`. Frontend `api.ts` uses `credentials: 'include'` on all fetch calls -- no token handling in JS.

### Passwords
Hashed with `bcrypt` (via `bcryptjs` -- pure JS, no native deps). Passwords are never stored or compared in plain text. Login compares with `bcrypt.compareSync()`.

### Shared links
`GET /api/shared/:token` and `/api/shared/:token/download` are the only unauthenticated endpoints. They query by `share_token` where `shared=1 AND trashed=0`, returning only that single document's metadata/file. No directory listing, no path traversal, no access to other documents.

### Trash cleanup
On every app start and once per hour via `setInterval`, run:
```sql
DELETE FROM documents WHERE trashed = 1
  AND trashed_at < datetime('now', '-30 days')
```
Also delete the corresponding files from disk. Retention period configurable via `TRASH_RETENTION_DAYS` env var (default: 30).

## What Changes

### 1. Create `server.cjs`
Express server with routes:

- **Auth**: `POST /api/auth/login` (sets httpOnly cookie), `POST /api/auth/logout` (clears cookie), `GET /api/auth/me`
- **Documents**: CRUD, upload (multipart via multer), download, star, trash, restore, share, permanent delete
- **Tags**: CRUD + document-tag associations
- **Notes**: GET/PUT per document
- **Users** (admin only): list, create, update role
- **Settings**: GET/PATCH (registration toggle)
- **Shared**: GET metadata + GET download (no auth required)
- **Logo**: POST upload

Auth middleware reads session cookie, looks up in `sessions` table, attaches `req.user`. Shared endpoints skip auth.

Static serving: in production, serves Vite `dist/` folder.

### 2. Rewrite `src/lib/api.ts`
Replace localStorage/IndexedDB calls with `fetch('/api/...', { credentials: 'include' })`. Same exported function signatures so hooks and pages need zero changes.

### 3. Delete `src/lib/store.ts`
No longer needed.

### 4. Update `vite.config.ts`
Add proxy: `/api` -> `http://localhost:3001` for development.

### 5. Update `package.json`
Add dependencies: `express`, `multer`, `better-sqlite3`, `cookie-parser`, `bcryptjs`.
Add scripts: `"start": "node server.cjs"`, `"dev:server": "node server.cjs"`.

### 6. Update Docker setup
**Dockerfile** (multi-stage):
- Stage 1: Build frontend with `npm install` + `npm run build`
- Stage 2: `node:20-alpine`, copy `dist/`, `server.cjs`, `package.json`, install production deps, expose 3001, `CMD ["node", "server.cjs"]`

**docker-compose.yml**: port 3000:3001, volume `./data:/app/data`.

### 7. SQLite schema (auto-created on first run)
```sql
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE, full_name TEXT,
  role TEXT DEFAULT 'user', password_hash TEXT, accent_color TEXT,
  avatar_url TEXT, workspace_logo_url TEXT, created_at TEXT);

CREATE TABLE sessions (token TEXT PRIMARY KEY, user_id TEXT, created_at TEXT);

CREATE TABLE documents (id TEXT PRIMARY KEY, user_id TEXT, name TEXT,
  file_type TEXT, file_size INTEGER, storage_path TEXT, starred INTEGER DEFAULT 0,
  trashed INTEGER DEFAULT 0, trashed_at TEXT, shared INTEGER DEFAULT 0,
  share_token TEXT, created_at TEXT, updated_at TEXT);

CREATE TABLE tags (id TEXT PRIMARY KEY, user_id TEXT, name TEXT,
  color TEXT, created_at TEXT);

CREATE TABLE document_tags (document_id TEXT, tag_id TEXT,
  PRIMARY KEY(document_id, tag_id));

CREATE TABLE notes (id TEXT PRIMARY KEY, document_id TEXT, user_id TEXT,
  content TEXT, created_at TEXT, updated_at TEXT);

CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);
```

## Files Summary

| Action | File |
|--------|------|
| Create | `server.cjs` |
| Rewrite | `src/lib/api.ts` |
| Delete | `src/lib/store.ts` |
| Edit | `package.json` |
| Edit | `vite.config.ts` |
| Rewrite | `Dockerfile` |
| Edit | `docker-compose.yml` |
| Edit | `.dockerignore` |

No changes to UI components, hooks, contexts, or pages.

