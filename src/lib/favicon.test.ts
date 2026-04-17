import { describe, expect, it } from 'vitest';
import { getFaviconMimeType } from './favicon';

describe('getFaviconMimeType', () => {
  it('maps common favicon URLs to browser-friendly mime types', () => {
    expect(getFaviconMimeType('/favicon.svg')).toBe('image/svg+xml');
    expect(getFaviconMimeType('/icon.png?v=123')).toBe('image/png');
    expect(getFaviconMimeType('/brand.ico?v=456')).toBe('image/x-icon');
    expect(getFaviconMimeType('/unknown.bin')).toBeNull();
  });
});
