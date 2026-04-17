function createSharesRepository(db) {
  return {
    clearExpiredForAll(updatedAt, isoNow) {
      db.prepare(`
        UPDATE documents
        SET shared = 0, share_token = NULL, share_expires_at = NULL, share_password_hash = NULL, updated_at = ?
        WHERE shared = 1 AND share_expires_at IS NOT NULL AND share_expires_at <= ?
      `).run(updatedAt, isoNow);
    },

    clearExpiredForUser(userId, updatedAt, isoNow) {
      db.prepare(`
        UPDATE documents
        SET shared = 0, share_token = NULL, share_expires_at = NULL, share_password_hash = NULL, updated_at = ?
        WHERE user_id = ? AND shared = 1 AND share_expires_at IS NOT NULL AND share_expires_at <= ?
      `).run(updatedAt, userId, isoNow);
    },

    disableShare(documentId, userId, updatedAt) {
      db.prepare(`
        UPDATE documents
        SET shared = 0, share_token = NULL, share_expires_at = NULL, share_password_hash = NULL, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(updatedAt, documentId, userId);
    },

    expireSharedDocument(documentId, updatedAt) {
      db.prepare(`
        UPDATE documents
        SET shared = 0, share_token = NULL, share_expires_at = NULL, share_password_hash = NULL, updated_at = ?
        WHERE id = ?
      `).run(updatedAt, documentId);
    },

    getSharedByToken(shareToken) {
      return db.prepare('SELECT * FROM documents WHERE share_token = ? AND shared = 1 AND trashed = 0').get(shareToken) || null;
    },

    updateShareState({ documentId, userId, shareExpiresAt, sharePasswordHash, shareToken, updatedAt }) {
      db.prepare(`
        UPDATE documents
        SET shared = 1,
            share_token = ?,
            share_expires_at = ?,
            share_password_hash = ?,
            updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(shareToken, shareExpiresAt, sharePasswordHash, updatedAt, documentId, userId);
    },
  };
}

module.exports = {
  createSharesRepository,
};
