function createSettingsRepository(db) {
  return {
    delete(key) {
      db.prepare('DELETE FROM settings WHERE key = ?').run(key);
    },

    getAll() {
      return db.prepare('SELECT key, value FROM settings').all();
    },

    getValue(key) {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return row ? row.value : null;
    },

    setMany(values) {
      const statement = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      const tx = db.transaction((entries) => {
        for (const [key, value] of entries) {
          statement.run(key, String(value));
        }
      });
      tx(Object.entries(values));
    },

    setValue(key, value) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
    },
  };
}

module.exports = {
  createSettingsRepository,
};
