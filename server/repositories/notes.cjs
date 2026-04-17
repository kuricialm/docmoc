function createNotesRepository(db) {
  return {
    create(note) {
      db.prepare('INSERT INTO notes (id, document_id, user_id, content, created_at, updated_at) VALUES (?,?,?,?,?,?)')
        .run(note.id, note.document_id, note.user_id, note.content, note.created_at, note.updated_at);
    },

    getByDocumentAndUserId(documentId, userId) {
      return db.prepare('SELECT * FROM notes WHERE document_id = ? AND user_id = ?').get(documentId, userId) || null;
    },

    updateById(noteId, content, updatedAt) {
      db.prepare('UPDATE notes SET content = ?, updated_at = ? WHERE id = ?').run(content, updatedAt, noteId);
    },
  };
}

module.exports = {
  createNotesRepository,
};
