
Root cause is very likely not the URL builder itself, but the modal flow still allowing an empty/invalid value to reach the clipboard path. I found three weak points in the current implementation:

1. `DocumentViewer` stores `shareUrl` in local state, but it also resets that state from `doc` whenever the polled documents query refreshes. Since documents refetch every second, the modal can get briefly re-synced from stale `doc.share_token` data and overwrite the valid URL you just generated.
2. The modal only shows/copies `shareUrl`, so if that state is nulled or stale for even one render, the copy action can run against the wrong source.
3. The clipboard helper should be hardened so it never attempts to copy undefined/blank text and gives a stricter failure signal.

Plan

1. Make the modal use a single reliable source of truth for the link
- In `DocumentViewer.tsx`, compute the current share URL from:
  - the last successful generated token/URL kept locally, or
  - the latest `doc.share_token` from props
- Do not blindly overwrite a valid locally generated share URL with `null` during polling refreshes.

2. Harden the generate-link flow
- In the share mutation `onSuccess`, persist the returned token/url immediately.
- Copy that exact generated URL before closing the share dialog.
- If the API returns no token while sharing is enabled, show an explicit error toast instead of silently proceeding.

3. Fix the modal copy button permanently
- Make `handleCopyLink` resolve the URL at click time from the safest available source, not just raw state.
- Trim/validate the final string before copying.
- Keep the button visible only when a valid URL exists.

4. Strengthen the clipboard helper
- Update `src/lib/share.ts` so `copyTextToClipboard` rejects empty strings.
- Keep Clipboard API first, but make the fallback stricter and more deterministic.
- This helps prevent “success but blank clipboard” behavior.

5. Preserve your datetime UX
- Keep `openShareSettings()` defaulting to the user’s current local datetime every time the modal opens for editing, as requested.

6. Validate after implementation
- Generate a share link from the document modal and confirm it auto-copies the real URL
- Close/reopen the modal and confirm “Copy link” still copies the same URL
- Open from “Shared by Me”, use the modal copy button, and confirm no blank clipboard result
- Re-test the page-level “Copy Link” button to ensure no regression

Files to update
- `src/components/DocumentViewer.tsx`
- `src/lib/share.ts`

Technical note
The strongest fix is to stop relying on a fragile `shareUrl` state that gets reset during query polling, and instead derive the link from a stable token/url source plus stricter clipboard validation.
