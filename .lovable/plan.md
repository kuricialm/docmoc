

# Rebuild Docmoc Without Supabase

## Overview
Strip all Supabase dependencies and replace them with a portable API client layer backed by in-memory/localStorage state. The app will be fully functional in the browser for demo/development, and architecturally ready to swap in any self-hosted backend (e.g. Express + SQLite + local filesystem).

## Architecture

```text
┌─────────────────────────────────────────┐
│  React Frontend (unchanged UI/UX)       │
│                                         │
│  hooks/useDocuments ─┐                  │
│  hooks/useTags      ─┤─► src/lib/api.ts │
│  hooks/useNotes     ─┤   (API client)   │
│  contexts/AuthContext┘                  │
│                                         │
│  src/lib/api.ts ───► localStorage store │
│  (swap later for fetch() to real API)   │
└─────────────────────────────────────────┘
```

## What Changes

### 1. Remove Supabase entirely
- Delete `src/integrations/supabase/` directory
- Delete `supabase/` directory (migrations, edge functions, config)
- Remove `@supabase/supabase-js` from package.json
- Remove `.env` references to Supabase vars

### 2. Create `src/lib/api.ts` — portable data layer
A single module that provides all CRUD operations using localStorage + in-memory state. Every function returns typed data matching the existing interfaces. This makes it trivial to later replace with `fetch('/api/...')` calls.

Functions:
- **Auth**: `login(email, password)`, `signOut()`, `getCurrentUser()`, `updatePassword()`, `createUser()` (admin)
- **Documents**: `getDocuments(filters)`, `uploadDocument(file)`, `renameDocument()`, `toggleStar()`, `trashDocument()`, `restoreDocument()`, `permanentDelete()`, `toggleShare()`, `downloadDocument()`, `getDocumentPreviewUrl()`
- **Tags**: `getTags()`, `createTag()`, `updateTag()`, `deleteTag()`, `addTagToDoc()`, `removeTagFromDoc()`
- **Notes**: `getNote(docId)`, `upsertNote(docId, content)`
- **Users** (admin): `getUsers()`, `updateUserRole()`
- **Settings**: `updateProfile()`, `uploadLogo()`

Storage: Documents stored as base64 in localStorage (or IndexedDB for larger files). A seed admin user (`admin@docmoc.local` / `admin`) is pre-configured.

### 3. Rewrite `src/contexts/AuthContext.tsx`
- Remove all Supabase auth imports
- Use `api.login()`, `api.signOut()`, `api.getCurrentUser()`
- Keep the same context shape (`user`, `session`, `loading`, `isAdmin`, `profile`, `signOut`, `refreshProfile`)
- Persist session in localStorage

### 4. Rewrite hooks (same interfaces, different backend)
- **`useDocuments.ts`**: Replace Supabase queries with `api.getDocuments()`, mutations with `api.uploadDocument()` etc. Keep TanStack Query for caching/invalidation.
- **`useTags.ts`**: Replace Supabase calls with `api.getTags()` etc.
- **`useNotes.ts`**: Replace with `api.getNote()` / `api.upsertNote()`

### 5. Update pages (minimal changes)
- **`Login.tsx`**: Call `api.login()` instead of `supabase.auth.signInWithPassword()`
- **`Settings.tsx`**: Call `api.updatePassword()`, `api.uploadLogo()`, `api.updateProfile()`
- **`Admin.tsx`**: Call `api.getUsers()`, `api.createUser()`, `api.updateUserRole()`
- **`SharedDocument.tsx`**: Call `api.getSharedDocument(token)` instead of edge function
- **`ResetPassword.tsx`**: Simplified (localStorage-based password update)
- **`DocumentViewer.tsx`**: Use `api.getDocumentPreviewUrl()` for preview URLs

### 6. Document previews (no storage service)
- Files stored as `File`/`Blob` objects in IndexedDB via a small helper
- Preview URLs generated with `URL.createObjectURL()`
- PDF: iframe with blob URL
- Images: img with blob URL
- Text: read as text from blob
- Other formats: file-type icon fallback (unchanged)

### 7. Shared documents
- Share tokens stored in the document record
- `SharedDocument.tsx` reads from localStorage/IndexedDB directly (same origin)
- For a real self-hosted deployment, this would hit a public API endpoint

### 8. Keep unchanged
- All UI components (`DocumentCard`, `DocumentListView`, `DashboardStats`, `FileTypeIcon`, `TagManager`, `TopBar`, `AppSidebar`, `RenameDialog`)
- All shadcn/ui components
- Routing structure
- CSS/styling
- TanStack Query setup

## Technical Details

### Default seed data
```typescript
// Pre-configured admin user
{ id: 'admin-1', email: 'admin@docmoc.local', password: 'admin', 
  fullName: 'Admin', role: 'admin' }
```

### IndexedDB for file storage
Using `idb-keyval` (tiny library) or raw IndexedDB API to store uploaded files as blobs, keyed by document ID. This avoids localStorage's 5MB limit.

### Files to create
- `src/lib/api.ts` — all backend operations
- `src/lib/store.ts` — localStorage/IndexedDB persistence helpers

### Files to rewrite
- `src/contexts/AuthContext.tsx`
- `src/hooks/useDocuments.ts`
- `src/hooks/useTags.ts`
- `src/hooks/useNotes.ts`
- `src/pages/Login.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Admin.tsx`
- `src/pages/SharedDocument.tsx`
- `src/pages/ResetPassword.tsx`
- `src/components/DocumentViewer.tsx`
- `src/components/MainLayout.tsx` (remove supabase upload ref)

### Files to delete
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/` directory
- Remove `@supabase/supabase-js` and `uuid` from dependencies (use `crypto.randomUUID()` instead)

## Result
A fully working Docmoc app with all screens, flows, and interactions intact — zero external dependencies. Ready to connect to any self-hosted REST API by swapping `api.ts` implementations from localStorage to `fetch()`.

