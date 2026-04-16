import { formatFileSize } from '@/lib/fileTypes';

describe('formatFileSize', () => {
  it('switches from GB to TB for terabyte values', () => {
    expect(formatFileSize(1024 ** 4)).toBe('1 TB');
    expect(formatFileSize(1536 * 1024 ** 3)).toBe('1.5 TB');
  });

  it('returns a safe fallback for invalid values', () => {
    expect(formatFileSize(Number.NaN)).toBe('0 B');
    expect(formatFileSize(-1)).toBe('0 B');
  });
});
