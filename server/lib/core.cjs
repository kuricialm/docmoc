const crypto = require('crypto');

function uid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

function parseJsonValue(value, fallbackValue) {
  if (typeof value !== 'string' || !value.trim()) return fallbackValue;
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallbackValue;
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const rounded = value >= 10 || idx === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded} ${units[idx]}`;
}

function resolveDisplayName(...candidates) {
  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return 'Unknown user';
}

module.exports = {
  formatBytes,
  now,
  parseJsonValue,
  resolveDisplayName,
  uid,
};
