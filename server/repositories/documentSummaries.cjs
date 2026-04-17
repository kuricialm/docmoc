function createDocumentSummariesRepository(db) {
  return {
    getByDocumentAndUser(documentId, userId, summaryFormat) {
      return db.prepare(`
        SELECT document_id, user_id, summary_format, provider, model, status, source_fingerprint, coverage, content_json, error_message, generated_at, created_at, updated_at
        FROM document_summaries
        WHERE document_id = ? AND user_id = ? AND summary_format = ?
      `).get(documentId, userId, summaryFormat) || null;
    },

    upsert(documentId, userId, summaryFormat, values, timestamp) {
      const existing = this.getByDocumentAndUser(documentId, userId, summaryFormat);
      db.prepare(`
        INSERT INTO document_summaries (
          document_id,
          user_id,
          summary_format,
          provider,
          model,
          status,
          source_fingerprint,
          coverage,
          content_json,
          error_message,
          generated_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(document_id, user_id, summary_format) DO UPDATE SET
          provider = excluded.provider,
          model = excluded.model,
          status = excluded.status,
          source_fingerprint = excluded.source_fingerprint,
          coverage = excluded.coverage,
          content_json = excluded.content_json,
          error_message = excluded.error_message,
          generated_at = excluded.generated_at,
          updated_at = excluded.updated_at
      `).run(
        documentId,
        userId,
        summaryFormat,
        values.provider,
        values.model || null,
        values.status,
        values.source_fingerprint,
        values.coverage || null,
        values.content_json || null,
        values.error_message || null,
        values.generated_at || null,
        existing?.created_at || timestamp,
        timestamp,
      );
    },
  };
}

module.exports = {
  createDocumentSummariesRepository,
};
