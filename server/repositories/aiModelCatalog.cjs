const { parseJsonValue } = require('../lib/core.cjs');

function createAiModelCatalogRepository(db) {
  return {
    deleteByUserAndProvider(userId, provider) {
      db.prepare('DELETE FROM user_ai_model_catalog WHERE user_id = ? AND provider = ?').run(userId, provider);
    },

    getByUserAndProvider(userId, provider) {
      const row = db.prepare(`
        SELECT models_json, fetched_at
        FROM user_ai_model_catalog
        WHERE user_id = ? AND provider = ?
      `).get(userId, provider);

      if (!row) return { text: [], vision: [], fetched_at: null };
      const parsed = parseJsonValue(row.models_json, { text: [], vision: [] });
      return {
        fetched_at: row.fetched_at || null,
        text: Array.isArray(parsed?.text) ? parsed.text : [],
        vision: Array.isArray(parsed?.vision) ? parsed.vision : [],
      };
    },

    upsert(userId, provider, catalog, timestamp) {
      db.prepare(`
        INSERT INTO user_ai_model_catalog (
          user_id,
          provider,
          models_json,
          fetched_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, provider) DO UPDATE SET
          models_json = excluded.models_json,
          fetched_at = excluded.fetched_at,
          updated_at = excluded.updated_at
      `).run(
        userId,
        provider,
        JSON.stringify({
          text: Array.isArray(catalog?.text) ? catalog.text : [],
          vision: Array.isArray(catalog?.vision) ? catalog.vision : [],
        }),
        timestamp,
        timestamp,
        timestamp,
      );
    },
  };
}

module.exports = {
  createAiModelCatalogRepository,
};
