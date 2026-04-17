const { now } = require('../lib/core.cjs');
const migrations = require('../migrations/index.cjs');

function ensureMigrationTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    )
  `);
}

function runMigrations(db) {
  ensureMigrationTable(db);
  const appliedIds = new Set(
    db.prepare('SELECT id FROM schema_migrations ORDER BY id ASC').all().map((row) => row.id)
  );

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) continue;
    const applyMigration = db.transaction(() => {
      migration.up(db);
      db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)')
        .run(migration.id, migration.name, now());
    });
    applyMigration();
  }
}

module.exports = {
  runMigrations,
};
