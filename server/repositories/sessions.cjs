function createSessionsRepository(db) {
  return {
    createSession(token, userId, createdAt) {
      db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?,?,?)').run(token, userId, createdAt);
    },

    deleteByToken(token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    },

    deleteByUserId(userId) {
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    },

    getByToken(token) {
      return db.prepare('SELECT token, user_id, created_at FROM sessions WHERE token = ?').get(token) || null;
    },
  };
}

module.exports = {
  createSessionsRepository,
};
