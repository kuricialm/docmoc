// @vitest-environment node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createDatabase } = require('./createDatabase.cjs');
const { runMigrations } = require('./runMigrations.cjs');

const tempDirs = [];

function makeConfig() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docmoc-migrate-'));
  tempDirs.push(dataDir);
  return { dataDir };
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { force: true, recursive: true });
  }
});

describe('runMigrations', () => {
  it('creates the schema and records applied migrations', () => {
    const db = createDatabase(makeConfig());
    runMigrations(db);

    const migrations = db.prepare('SELECT id FROM schema_migrations ORDER BY id').all();
    expect(migrations.length).toBeGreaterThanOrEqual(6);

    const userColumns = db.prepare('PRAGMA table_info(users)').all().map((col) => col.name);
    const documentColumns = db.prepare('PRAGMA table_info(documents)').all().map((col) => col.name);
    const aiPreferenceColumns = db.prepare('PRAGMA table_info(user_ai_preferences)').all().map((col) => col.name);

    expect(userColumns).toContain('suspended');
    expect(userColumns).toContain('last_sign_in_at');
    expect(userColumns).toContain('upload_quota_bytes');
    expect(documentColumns).toContain('share_expires_at');
    expect(documentColumns).toContain('share_password_hash');
    expect(documentColumns).toContain('uploaded_by_name_snapshot');
    expect(aiPreferenceColumns).toContain('summary_prompt');

    const registrationSetting = db.prepare("SELECT value FROM settings WHERE key = 'registration_enabled'").get();
    expect(registrationSetting?.value).toBe('true');

    db.close();
  });
});
