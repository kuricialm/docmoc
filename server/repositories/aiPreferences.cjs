function createAiPreferencesRepository(db) {
  return {
    deleteByUserAndProvider(userId, provider) {
      db.prepare('DELETE FROM user_ai_preferences WHERE user_id = ? AND provider = ?').run(userId, provider);
    },

    getByUserAndProvider(userId, provider) {
      return db.prepare(`
        SELECT user_id, provider, text_model_id, vision_model_id, summary_prompt, created_at, updated_at
        FROM user_ai_preferences
        WHERE user_id = ? AND provider = ?
      `).get(userId, provider) || null;
    },

    upsert(userId, provider, values, timestamp) {
      const existing = this.getByUserAndProvider(userId, provider);
      db.prepare(`
        INSERT INTO user_ai_preferences (
          user_id,
          provider,
          text_model_id,
          vision_model_id,
          summary_prompt,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, provider) DO UPDATE SET
          text_model_id = excluded.text_model_id,
          vision_model_id = excluded.vision_model_id,
          summary_prompt = excluded.summary_prompt,
          updated_at = excluded.updated_at
      `).run(
        userId,
        provider,
        Object.prototype.hasOwnProperty.call(values, 'text_model_id') ? values.text_model_id : existing?.text_model_id || null,
        Object.prototype.hasOwnProperty.call(values, 'vision_model_id') ? values.vision_model_id : existing?.vision_model_id || null,
        Object.prototype.hasOwnProperty.call(values, 'summary_prompt') ? values.summary_prompt : existing?.summary_prompt || null,
        existing?.created_at || timestamp,
        timestamp,
      );
    },
  };
}

module.exports = {
  createAiPreferencesRepository,
};
