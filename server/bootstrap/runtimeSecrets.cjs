const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_BOOTSTRAP_ADMIN_PASSWORD = 'changeme123!';
const RUNTIME_SECRETS_FILENAME = '.runtime-secrets.json';
const RUNTIME_SECRET_KEYS = ['COOKIE_SECRET', 'AI_SECRETS_MASTER_KEY'];
const RUNTIME_SECRET_PLACEHOLDERS = {
  AI_SECRETS_MASTER_KEY: new Set([
    '',
    'change-me-for-ai-secrets',
    'REPLACE_WITH_A_SEPARATE_LONG_RANDOM_AI_SECRET',
  ]),
  COOKIE_SECRET: new Set([
    '',
    'change-me-in-production',
    'docmoc-secret-change-me',
    'REPLACE_WITH_A_LONG_RANDOM_COOKIE_SECRET',
  ]),
};

function resolveDataDir(env = process.env, projectDir = path.resolve(__dirname, '../..')) {
  const rawDataDir = typeof env.DATA_DIR === 'string' ? env.DATA_DIR.trim() : '';
  return rawDataDir ? path.resolve(rawDataDir) : path.join(projectDir, 'data');
}

function isRuntimeSecretValueUsable(key, value) {
  if (typeof value !== 'string') return false;
  const normalized = value.trim();
  return normalized !== '' && !RUNTIME_SECRET_PLACEHOLDERS[key].has(normalized);
}

function readRuntimeSecrets(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return RUNTIME_SECRET_KEYS.reduce((accumulator, key) => {
      if (typeof parsed?.[key] === 'string') {
        accumulator[key] = parsed[key].trim();
      }
      return accumulator;
    }, {});
  } catch {
    return {};
  }
}

function writeRuntimeSecrets(filePath, secrets) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(secrets, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tempPath, filePath);
  fs.chmodSync(filePath, 0o600);
}

function generateRuntimeSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function bootstrapRuntimeSecrets(env = process.env, options = {}) {
  const nodeEnv = env.NODE_ENV || 'development';
  if (nodeEnv !== 'production') {
    return null;
  }

  const projectDir = options.projectDir ? path.resolve(options.projectDir) : path.resolve(__dirname, '../..');
  const dataDir = resolveDataDir(env, projectDir);
  const filePath = path.join(dataDir, RUNTIME_SECRETS_FILENAME);
  const persistedSecrets = readRuntimeSecrets(filePath);
  const resolvedSecrets = {};
  let shouldWriteSecrets = !fs.existsSync(filePath);

  for (const key of RUNTIME_SECRET_KEYS) {
    const envValue = typeof env[key] === 'string' ? env[key].trim() : '';
    const persistedValue = typeof persistedSecrets[key] === 'string' ? persistedSecrets[key].trim() : '';

    if (isRuntimeSecretValueUsable(key, envValue)) {
      resolvedSecrets[key] = envValue;
    } else if (isRuntimeSecretValueUsable(key, persistedValue)) {
      resolvedSecrets[key] = persistedValue;
    } else {
      resolvedSecrets[key] = generateRuntimeSecret();
      shouldWriteSecrets = true;
    }

    if (persistedValue !== resolvedSecrets[key]) {
      shouldWriteSecrets = true;
    }
  }

  if (shouldWriteSecrets) {
    writeRuntimeSecrets(filePath, resolvedSecrets);
  }

  for (const key of RUNTIME_SECRET_KEYS) {
    env[key] = resolvedSecrets[key];
  }

  return {
    dataDir,
    filePath,
    secrets: resolvedSecrets,
  };
}

module.exports = {
  DEFAULT_BOOTSTRAP_ADMIN_PASSWORD,
  RUNTIME_SECRET_KEYS,
  bootstrapRuntimeSecrets,
  readRuntimeSecrets,
  resolveDataDir,
};
