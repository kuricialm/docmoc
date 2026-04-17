function ensureColumn(db, tableName, columnName, sqlDefinition) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!cols.some((col) => col.name === columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${sqlDefinition}`);
  }
}

module.exports = {
  id: '003_document_columns',
  name: 'Add sharing and uploader snapshot columns to documents',
  up(db) {
    ensureColumn(db, 'documents', 'share_expires_at', 'share_expires_at TEXT');
    ensureColumn(db, 'documents', 'share_password_hash', 'share_password_hash TEXT');
    ensureColumn(db, 'documents', 'uploaded_by_name_snapshot', 'uploaded_by_name_snapshot TEXT');
  },
};
