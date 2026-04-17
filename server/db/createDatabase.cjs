const Database = require('better-sqlite3');
const path = require('path');

function createDatabase(config) {
  const db = new Database(path.join(config.dataDir, 'docmoc.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

module.exports = {
  createDatabase,
};
