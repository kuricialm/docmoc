

## Thumbnail Refinements — Higher Quality + A4 Sheet Layout

### Changes

#### `src/components/DocumentThumbnail.tsx`
- Increase PDF render width from 400px to 800px for sharper text
- Keep JPEG format (0.92 quality instead of 0.8) for efficiency
- Change the `<img>` styling from `w-full h-full object-cover` to a centered floating A4 sheet: `max-h-[85%] max-w-[70%] object-contain shadow-md rounded-sm` inside a flex-centered container
- The thumbnail sits centered with the card background visible around it, creating the "page cutoff" effect from your reference

#### `src/components/DocumentCard.tsx`
- Add `p-3 flex items-center justify-center` to the thumbnail container area so the preview floats with padding on all sides
- Keep the muted background so the "sheet" stands out against it

### Files modified
- `src/components/DocumentThumbnail.tsx`
- `src/components/DocumentCard.tsx`

