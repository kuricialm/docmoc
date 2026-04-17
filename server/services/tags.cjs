const { notFound } = require('../errors/apiError.cjs');

function createTagsService({
  documentTagsRepository,
  documentsRepository,
  historyRepository,
  tagsRepository,
  now,
  uid,
}) {
  return {
    addTagToDocument(documentId, tagId, userId) {
      const owned = documentsRepository.getByIdAndUserId(documentId, userId);
      if (!owned) throw notFound('Not found');
      const result = documentTagsRepository.add(documentId, tagId);
      if (!result || result.changes === 0) return;
      documentsRepository.updateUpdatedAt(documentId, userId, now());
      const tag = tagsRepository.getByIdAndUserId(tagId, userId);
      historyRepository.create({
        action: 'tag_added',
        created_at: now(),
        details: JSON.stringify({ tagName: tag?.name || tagId }),
        document_id: documentId,
        id: uid(),
        user_id: userId,
      });
    },

    createTag(userId, { color, name }) {
      return tagsRepository.createTag({
        color,
        created_at: now(),
        id: uid(),
        name,
        user_id: userId,
      });
    },

    deleteTag(tagId, userId) {
      documentTagsRepository.deleteByTagId(tagId);
      tagsRepository.deleteByIdAndUserId(tagId, userId);
    },

    listTags(userId) {
      return tagsRepository.listByUserId(userId);
    },

    removeTagFromDocument(documentId, tagId, userId) {
      const owned = documentsRepository.getByIdAndUserId(documentId, userId);
      if (!owned) throw notFound('Not found');
      const tag = tagsRepository.getByIdAndUserId(tagId, userId);
      const result = documentTagsRepository.remove(documentId, tagId);
      if (result.changes === 0) return;
      documentsRepository.updateUpdatedAt(documentId, userId, now());
      historyRepository.create({
        action: 'tag_removed',
        created_at: now(),
        details: JSON.stringify({ tagName: tag?.name || tagId }),
        document_id: documentId,
        id: uid(),
        user_id: userId,
      });
    },

    updateTag(tagId, userId, { color, name }) {
      tagsRepository.updateByIdAndUserId(tagId, userId, { color, name });
    },
  };
}

module.exports = {
  createTagsService,
};
