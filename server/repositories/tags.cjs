function createTagsRepository(db) {
  return {
    createTag(tag) {
      db.prepare('INSERT INTO tags (id, user_id, name, color, created_at) VALUES (?,?,?,?,?)')
        .run(tag.id, tag.user_id, tag.name, tag.color, tag.created_at);
      return tag;
    },

    deleteByIdAndUserId(tagId, userId) {
      db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(tagId, userId);
    },

    getByIdAndUserId(tagId, userId) {
      return db.prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?').get(tagId, userId) || null;
    },

    listByUserId(userId) {
      return db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name').all(userId);
    },

    updateByIdAndUserId(tagId, userId, { color, name }) {
      db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?').run(name, color, tagId, userId);
    },
  };
}

module.exports = {
  createTagsRepository,
};
