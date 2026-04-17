module.exports = {
  id: '005_backfill_user_full_names',
  name: 'Backfill empty full names from email',
  up(db) {
    db.exec(`
      UPDATE users
      SET full_name = email
      WHERE full_name IS NULL OR TRIM(full_name) = ''
    `);
  },
};
