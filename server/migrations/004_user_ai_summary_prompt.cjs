function ensureColumn(db, tableName, columnName, sqlDefinition) {
  const cols = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!cols.some((col) => col.name === columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${sqlDefinition}`);
  }
}

module.exports = {
  id: '004_user_ai_summary_prompt',
  name: 'Add summary prompt to user AI preferences',
  up(db) {
    ensureColumn(db, 'user_ai_preferences', 'summary_prompt', 'summary_prompt TEXT');
  },
};
