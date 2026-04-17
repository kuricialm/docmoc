function ensureColumn(db, tableName, columnName, sqlDefinition) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!cols.some((col) => col.name === columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${sqlDefinition}`);
  }
}

module.exports = {
  id: '002_user_columns',
  name: 'Add suspended and quota columns to users',
  up(db) {
    ensureColumn(db, 'users', 'suspended', 'suspended INTEGER DEFAULT 0');
    ensureColumn(db, 'users', 'last_sign_in_at', 'last_sign_in_at TEXT');
    ensureColumn(db, 'users', 'upload_quota_bytes', 'upload_quota_bytes INTEGER');
  },
};
