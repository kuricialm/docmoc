module.exports = [
  require('./001_initial_schema.cjs'),
  require('./002_user_columns.cjs'),
  require('./003_document_columns.cjs'),
  require('./004_user_ai_summary_prompt.cjs'),
  require('./005_backfill_user_full_names.cjs'),
  require('./006_default_registration_setting.cjs'),
];
