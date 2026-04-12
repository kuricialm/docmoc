

# Plan: Docmoc UX and Functional Fixes

## Changes

### 1. Tag management from sidebar (not document menu)
- Remove "Manage Tags" from DocumentCard dropdown menu
- Add a "Manage Tags" link/button in the sidebar Tags section header (visible when expanded)
- Create a standalone TagManagerDialog that opens from the sidebar to create/rename/delete tags (not document-specific)
- Keep per-document tag assignment inline in the DocumentViewer (see below)

### 2. Sidebar tag items: rename and better UX
- Change the sidebar "Tags" section label to just "Tags" (already correct)
- Use `Tag` icon instead of `Star` icon for the "Manage Tags" menu item in DocumentCard (fix the icon mismatch)
- Add hover background to sidebar tag links for better hover UX

### 3. Inline tag add/remove in DocumentViewer
- In the tags section of DocumentViewer, show each tag as a pill with an X button to remove it
- Add a "+" button after all tags that opens a small popover/dropdown to pick from existing tags and add them
- This replaces the separate TagManager dialog when viewing a document

### 4. Star toggle in DocumentViewer
- Add a star button in the DocumentViewer header next to the document title
- Clicking toggles starred state using existing `toggleStar` mutation

### 5. Fix sharing
- Debug: the `toggleShare` mutation looks correct. The issue is likely that the `SharedDocument` page queries with `.eq('share_token', token)` but needs anon access. Check the RLS policy -- there IS an anon SELECT policy for shared docs. The storage bucket is private though, so the SharedDocument page tries `supabase.storage.from('documents').download()` and `createSignedUrl()` as anon, which will fail due to storage RLS.
- Fix: Create a storage policy allowing public/anon download when the file's document record has `shared = true`, OR use a signed URL approach from an edge function. Simplest fix: add a storage RLS policy for the `documents` bucket that allows SELECT for objects matching shared documents.
- Actually, Supabase storage policies work on the bucket level with path-based policies, not document metadata. The cleanest fix: create a small edge function `get-shared-file` that takes a share_token, verifies the document is shared, and returns the file using the service role key.

### 6. Fix "preview not available" icon centering
- In DocumentViewer, the fallback `<div className="text-center space-y-3">` renders FileTypeIcon which is just an inline SVG. Add `flex flex-col items-center` to center it properly.

### 7. UI polish / less rigid feel
- Add `transition-shadow` and smoother hover states to cards
- Soften border radius on cards (use `rounded-xl` instead of `rounded-lg`)
- Add subtle animation to dialog/modal open
- Improve spacing and typography weight balance
- Make buttons and interactive elements feel more fluid with better transitions

## Technical Details

**Files to modify:**
- `src/components/AppSidebar.tsx` — add "Manage Tags" button in sidebar
- `src/components/DocumentViewer.tsx` — add star toggle, inline tag add/remove with X and +
- `src/components/DocumentCard.tsx` — change Tag icon from Star to Tag, remove or keep "Tags" in dropdown
- `src/components/TagManager.tsx` — refactor to work as standalone (sidebar-triggered) tag CRUD, not document-specific
- `src/pages/SharedDocument.tsx` — use edge function for file access
- `src/components/FileTypeIcon.tsx` — no change needed
- `supabase/functions/get-shared-file/index.ts` — new edge function for shared file download
- `src/index.css` — minor transition/animation improvements

**New edge function `get-shared-file`:**
- Accepts `token` query param
- Looks up document by share_token where shared=true and trashed=false
- Downloads file from storage using service role
- Returns file with proper content-type headers

