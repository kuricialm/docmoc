const { notFound } = require('../errors/apiError.cjs');

function createNotesHistoryService({
  documentPresenter,
  documentsRepository,
  historyRepository,
  notesRepository,
  now,
  uid,
}) {
  return {
    getHistory(documentId, user) {
      const startedAt = Date.now();
      const owned = documentsRepository.getByIdAndUserId(documentId, user.id);
      if (!owned) throw notFound('Not found');

      let mapped = historyRepository.listByDocumentId(documentId).map(documentPresenter.mapHistoryRow);
      const hasUploadAction = mapped.some((event) => event.action === 'uploaded');
      if (!hasUploadAction) {
        mapped = [
          ...mapped,
          {
            action: 'uploaded',
            actor_name: user.full_name || user.email || 'Unknown user',
            created_at: owned.created_at || now(),
            details: { name: owned.name },
            document_id: owned.id,
            id: `synthetic-upload-${owned.id}`,
            user_id: user.id,
          },
        ];
      }

      mapped.sort((a, b) => b.created_at.localeCompare(a.created_at));
      const elapsed = Date.now() - startedAt;
      if (elapsed > 200) {
        console.warn('[history] slow-request', { documentId, ms: elapsed, userId: user.id });
      }
      return mapped;
    },

    getNote(documentId, userId) {
      return notesRepository.getByDocumentAndUserId(documentId, userId);
    },

    upsertNote(documentId, userId, content) {
      const owned = documentsRepository.getByIdAndUserId(documentId, userId);
      if (!owned) throw notFound('Not found');

      const existing = notesRepository.getByDocumentAndUserId(documentId, userId);
      const timestamp = now();
      if (existing) {
        notesRepository.updateById(existing.id, content, timestamp);
      } else {
        notesRepository.create({
          content,
          created_at: timestamp,
          document_id: documentId,
          id: uid(),
          updated_at: timestamp,
          user_id: userId,
        });
      }

      documentsRepository.updateUpdatedAt(documentId, userId, timestamp);
      historyRepository.create({
        action: existing ? 'comment_edited' : 'comment_added',
        created_at: timestamp,
        details: null,
        document_id: documentId,
        id: uid(),
        user_id: userId,
      });
    },
  };
}

module.exports = {
  createNotesHistoryService,
};
