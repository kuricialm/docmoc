module.exports = {
  id: '006_default_registration_setting',
  name: 'Ensure registration setting exists',
  up(db) {
    const existing = db.prepare("SELECT value FROM settings WHERE key = 'registration_enabled'").get();
    if (!existing) {
      db.prepare("INSERT INTO settings (key, value) VALUES ('registration_enabled', 'true')").run();
    }
  },
};
