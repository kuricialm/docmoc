const { normalizeUploadedFilename } = require('../lib/fileMeta.cjs');
const { parseJsonValue, resolveDisplayName } = require('../lib/core.cjs');

function createDocumentPresenter({ documentTagsRepository, documentsRepository, usersRepository }) {
  function resolveUploaderName(doc, ownerOverride = null) {
    const owner = ownerOverride || usersRepository.getById(doc.user_id);
    const resolved = resolveDisplayName(doc.uploaded_by_name_snapshot, owner?.full_name, owner?.email);

    if ((!doc.uploaded_by_name_snapshot || !String(doc.uploaded_by_name_snapshot).trim()) && resolved !== 'Unknown user') {
      documentsRepository.updateUploadedByNameSnapshot(doc.id, resolved);
    }

    return resolved;
  }

  function mapHistoryRow(row) {
    let parsedDetails = null;
    if (row.details && row.details.startsWith('{')) {
      parsedDetails = parseJsonValue(row.details, null);
    }

    return {
      action: row.action,
      actor_name: row.actor_name,
      created_at: row.created_at,
      details: parsedDetails,
      document_id: row.document_id,
      id: row.id,
      user_id: row.user_id,
    };
  }

  return {
    mapHistoryRow,

    presentOwnedDocument(doc, ownerOverride = null) {
      const { share_password_hash, ...rest } = doc;
      return {
        ...rest,
        name: normalizeUploadedFilename(rest.name),
        share_has_password: !!share_password_hash,
        shared: !!doc.shared,
        starred: !!doc.starred,
        tag_ids: [],
        tags: documentTagsRepository.listByDocumentId(doc.id),
        trashed: !!doc.trashed,
        uploaded_by_name: resolveUploaderName(doc, ownerOverride),
      };
    },

    presentSharedDocument(doc, ownerOverride = null) {
      const { share_password_hash, uploaded_by_name_snapshot, ...safeDoc } = doc;
      return {
        ...safeDoc,
        name: normalizeUploadedFilename(doc.name),
        shared: true,
        starred: !!doc.starred,
        tags: documentTagsRepository.listByDocumentId(doc.id),
        trashed: false,
        uploaded_by_name: resolveUploaderName(doc, ownerOverride),
      };
    },

    resolveUploaderName,
  };
}

module.exports = {
  createDocumentPresenter,
};
