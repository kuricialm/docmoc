function createDocumentTagsRepository(db) {
  return {
    add(documentId, tagId) {
      return db.prepare('INSERT OR IGNORE INTO document_tags (document_id, tag_id) VALUES (?, ?)').run(documentId, tagId);
    },

    deleteByTagId(tagId) {
      db.prepare('DELETE FROM document_tags WHERE tag_id = ?').run(tagId);
    },

    listByDocumentId(documentId) {
      return db.prepare(`
        SELECT t.id, t.name, t.color
        FROM tags t
        JOIN document_tags dt ON dt.tag_id = t.id
        WHERE dt.document_id = ?
      `).all(documentId);
    },

    remove(documentId, tagId) {
      return db.prepare('DELETE FROM document_tags WHERE document_id = ? AND tag_id = ?').run(documentId, tagId);
    },
  };
}

module.exports = {
  createDocumentTagsRepository,
};
