
# Docmoc — Premium Document Manager

## Overview
A fully functional, minimal, premium document management app with admin/user roles, private workspaces, tagging, sharing, trash, and a polished modern UI.

## Design Direction
- **Palette**: Dark sidebar (#0F172A navy), clean white content area, slate accents, subtle blue primary (#3B82F6)
- **Typography**: Inter for body, clean hierarchy with font-weight contrast
- **Style**: Calm, premium, well-spaced cards with subtle shadows, refined borders, no emojis, no clutter

## Backend (Lovable Cloud / Supabase)

### Database Tables
- **profiles** — user metadata (name, avatar, workspace logo)
- **user_roles** — admin/user roles (enum-based, separate table)
- **documents** — file metadata (name, type, size, storage_path, user_id, starred, trashed, trashed_at, shared, share_token)
- **tags** — per-user colored tags (name, color, user_id)
- **document_tags** — many-to-many join
- **document_notes** — private notes per document per user

### Storage Buckets
- **documents** — file uploads (private, RLS-protected)
- **workspace-logos** — user workspace logos (public)

### RLS Policies
- Users can only access their own documents, tags, notes
- Admin can read all users/documents for management
- Public share access via share_token (no auth required)

### Edge Function
- **public-document** — serves shared documents by token without auth

## Frontend Pages & Components

### Auth
- **Login page** — clean, minimal sign-in form
- No self-registration (admin invites only)

### Main Layout
- **Sidebar** — navigation (All Documents, Recent, Starred, Shared by Me, Trash), tags list, settings link, admin link (admin only)
- **Top bar** — search, view toggle (grid/list), user menu

### Dashboard / All Documents
- **Stats bar** — total documents, recent uploads, shared count, trash count
- **Document grid** — premium cards with thumbnail/file-type icon, name, type badge, date, size, tags, quick actions (star, share, trash, download)
- **List view** — compact table alternative

### Document Viewer (Modal)
- Left: PDF/TXT preview (or "preview not available" message)
- Right: metadata (name, type, size, uploaded date, tags) + private notes editor

### Other Pages
- **Recent** — documents sorted by modified date
- **Starred** — starred documents only
- **Shared by Me** — all shared docs with toggle to disable sharing
- **Trash** — soft-deleted docs with restore/permanent delete, 30-day retention
- **Tag filter view** — documents filtered by selected tag

### Settings
- Change password (functional)
- Upload/change workspace logo
- Theme accent color picker (persisted, functional)

### Admin Area
- User list with roles
- Invite/create user form
- Edit user role
- View user workspaces (document counts)

## Key Functional Flows
1. **Admin invites user** → creates auth user + profile + role
2. **User signs in** → sees private workspace
3. **Upload** → file goes to Supabase storage, metadata saved
4. **Preview** → PDF rendered in iframe, TXT as text, others show format icon
5. **Tag** → create/assign/remove colored tags
6. **Share** → generate unique public link, toggle off later
7. **Trash** → soft delete with 30-day auto-cleanup
8. **Notes** → private per-document, only visible to owner
9. **Settings** → password change, logo upload, theme color — all functional

## Implementation Order
1. Database schema, RLS, storage buckets
2. Auth flow (login, protected routes)
3. Main layout (sidebar, topbar)
4. Document CRUD (upload, list, rename, download, delete)
5. Dashboard stats + card/list views
6. Document viewer modal with preview
7. Tags system
8. Starring + sharing
9. Trash with restore/permanent delete
10. Notes
11. Settings page
12. Admin area
13. Public share endpoint
14. Polish and end-to-end audit
