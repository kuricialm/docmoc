function stripQuery(value: string) {
  return value.split('?')[0] || value;
}

export function getFaviconMimeType(href: string | null | undefined) {
  if (!href) return null;
  const normalized = stripQuery(href).toLowerCase();
  if (normalized.endsWith('.svg')) return 'image/svg+xml';
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.ico')) return 'image/x-icon';
  return null;
}
