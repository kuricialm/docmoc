module.exports = {
  id: '007_default_trash_retention_setting',
  name: 'Ensure trash retention setting exists',
  up(db) {
    const existing = db.prepare("SELECT value FROM settings WHERE key = 'trash_retention_days'").get();
    if (!existing) {
      db.prepare("INSERT INTO settings (key, value) VALUES ('trash_retention_days', '30')").run();
    }
  },
};
