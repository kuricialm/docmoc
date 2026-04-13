

## Thumbnail Preview on Document Cards

### What you want
- For previewable documents (PDFs, images), show the first page / image as a visual thumbnail in the card's top area (like your screenshot showing the McKinsey PDF cover page).
- For non-previewable documents (DOCX, XLSX, etc.), keep the current icon display.
- A toggle in Settings to enable/disable thumbnail previews.

### Feasibility

**Images (PNG, JPG, GIF, WEBP, SVG)** -- Straightforward. The existing `/api/documents/:id/blob` endpoint already serves the file. The card can render an `<img>` tag with `object-fit: cover` using a blob URL. No server changes needed.

**PDFs** -- This is the main challenge. Two approaches:

1. **Client-side with pdfjs** (recommended): Use `pdfjs-dist` in the browser to render the first page of a PDF to a canvas, then use the canvas as the thumbnail. This is how most web document managers do it. No server changes needed. Trade-off: adds ~300KB to the bundle (pdfjs worker), and there's a small rendering delay per card.

2. **Server-side thumbnail generation**: Generate a thumbnail image on upload using a library like `pdf-poppler` or `sharp` + `pdf2pic` on the backend. Store the thumbnail alongside the file. Faster at display time but requires server-side dependencies (poppler/ghostscript) which complicates Docker setup.

**Recommendation**: Client-side pdfjs. It keeps the backend simple, works with existing uploads (no migration), and the thumbnails can be cached in memory or localStorage.

**Text files** -- Could render a few lines of text as a mini preview, but the visual impact is minimal. Suggest keeping the icon for these.

### Plan

#### 1. Add `pdfjs-dist` dependency
Install `pdfjs-dist` for client-side PDF rendering.

#### 2. Create `DocumentThumbnail` component
A new component that:
- For images: fetches the blob and renders `<img>` with `object-cover`
- For PDFs: fetches the blob, renders first page to a hidden canvas via pdfjs, displays the result
- For other types: falls back to `FileTypeIcon`
- Shows a skeleton/shimmer while loading
- Caches blob URLs in a simple in-memory map to avoid re-fetching on every render

#### 3. Update `DocumentCard`
Replace the static `FileTypeIcon` area with `DocumentThumbnail` when thumbnails are enabled. Pass a `thumbnailsEnabled` prop (from settings context or localStorage).

#### 4. Add Settings toggle
Add a "Thumbnail Previews" switch in the Settings page under a new "Display" section. Store the preference in localStorage (no backend change needed -- it's a per-device UI preference).

#### 5. Create a settings context/hook
A small `useSettings` hook that reads/writes `localStorage` for the thumbnail toggle, so all pages can access it.

### Files to create/modify
- **New**: `src/components/DocumentThumbnail.tsx` -- thumbnail renderer
- **New**: `src/hooks/useLocalSettings.ts` -- localStorage-backed display preferences
- **Modified**: `src/components/DocumentCard.tsx` -- use `DocumentThumbnail` instead of `FileTypeIcon` in the preview area
- **Modified**: `src/pages/Settings.tsx` -- add thumbnail toggle
- **Modified**: `package.json` -- add `pdfjs-dist`

### Technical notes
- pdfjs worker will be loaded from CDN or bundled via Vite
- Thumbnail canvas size: ~400x300px (enough for card display, small memory footprint)
- Blob URLs will be revoked on component unmount to prevent memory leaks
- The 1-second polling `refetchInterval` on documents won't cause re-renders of thumbnails thanks to the cache

