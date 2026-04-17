// @vitest-environment node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createDatabase } = require('./createDatabase.cjs');

const tempDirs = [];

function makeConfig() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docmoc-db-'));
  tempDirs.push(dataDir);
  return { dataDir };
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { force: true, recursive: true });
  }
});

describe('createDatabase', () => {
  it('opens sqlite with WAL and foreign keys enabled', () => {
    const db = createDatabase(makeConfig());
    expect(db.pragma('journal_mode', { simple: true })).toBe('wal');
    expect(db.pragma('foreign_keys', { simple: true })).toBe(1);
    db.close();
  });
});
