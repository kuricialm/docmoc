function createAiCredentialsRepository(db) {
  return {
    deleteByUserAndProvider(userId, provider) {
      db.prepare('DELETE FROM user_ai_credentials WHERE user_id = ? AND provider = ?').run(userId, provider);
    },

    getByUserAndProvider(userId, provider) {
      return db.prepare(`
        SELECT user_id, provider, encrypted_key, key_label, last4, validated_at, expires_at, status, last_error, last_model_sync_at
        FROM user_ai_credentials
        WHERE user_id = ? AND provider = ?
      `).get(userId, provider) || null;
    },

    upsert(userId, provider, values, timestamp) {
      db.prepare(`
        INSERT INTO user_ai_credentials (
          user_id,
          provider,
          encrypted_key,
          key_label,
          last4,
          validated_at,
          expires_at,
          status,
          last_error,
          last_model_sync_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, provider) DO UPDATE SET
          encrypted_key = excluded.encrypted_key,
          key_label = excluded.key_label,
          last4 = excluded.last4,
          validated_at = excluded.validated_at,
          expires_at = excluded.expires_at,
          status = excluded.status,
          last_error = excluded.last_error,
          last_model_sync_at = excluded.last_model_sync_at,
          updated_at = excluded.updated_at
      `).run(
        userId,
        provider,
        values.encrypted_key,
        values.key_label || null,
        values.last4 || null,
        values.validated_at || null,
        values.expires_at || null,
        values.status || 'valid',
        values.last_error || null,
        values.last_model_sync_at || null,
        timestamp,
        timestamp,
      );
    },
  };
}

module.exports = {
  createAiCredentialsRepository,
};
