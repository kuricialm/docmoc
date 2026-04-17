function createHistoryRepository(db) {
  return {
    create(event) {
      db.prepare('INSERT INTO document_history (id, document_id, user_id, action, details, created_at) VALUES (?,?,?,?,?,?)')
        .run(event.id, event.document_id, event.user_id, event.action, event.details, event.created_at);
    },

    getUploadEvent(documentId, userId) {
      return db.prepare(`
        SELECT id
        FROM document_history
        WHERE document_id = ? AND user_id = ? AND action = 'uploaded'
        LIMIT 1
      `).get(documentId, userId) || null;
    },

    listByDocumentId(documentId) {
      return db.prepare(`
        SELECT
          h.id,
          h.document_id,
          h.user_id,
          h.action,
          h.details,
          h.created_at,
          COALESCE(NULLIF(TRIM(u.full_name), ''), u.email, 'Unknown user') AS actor_name
        FROM document_history h
        LEFT JOIN users u ON u.id = h.user_id
        WHERE h.document_id = ?
        ORDER BY h.created_at DESC
        LIMIT 200
      `).all(documentId);
    },
  };
}

module.exports = {
  createHistoryRepository,
};
