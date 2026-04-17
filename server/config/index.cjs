const path = require('path');

function resolveTrustProxySetting(rawValue, nodeEnv) {
  if (rawValue === undefined) return nodeEnv === 'production' ? 1 : false;
  const normalized = String(rawValue).trim().toLowerCase();
  if (normalized === 'true') return 1;
  if (normalized === 'false') return false;
  const asNumber = Number.parseInt(normalized, 10);
  if (!Number.isNaN(asNumber)) return asNumber;
  return rawValue;
}

function loadConfig(env = process.env) {
  const rootDir = path.resolve(__dirname, '../..');
  const dataDir = env.DATA_DIR || path.join(rootDir, 'data');
  const nodeEnv = env.NODE_ENV || 'development';

  return {
    adminEmail: env.ADMIN_EMAIL || 'admin@docmoc.local',
    adminPassword: env.ADMIN_PASSWORD || 'admin',
    aiProviderOpenRouter: 'openrouter',
    cookieDomain: env.COOKIE_DOMAIN || undefined,
    cookieSecret: env.COOKIE_SECRET || 'docmoc-secret-change-me',
    cookieSecureMode: env.COOKIE_SECURE_MODE || 'auto',
    dataDir,
    distDir: path.join(rootDir, 'dist'),
    maxConcurrentSummariesPerUser: parseInt(env.MAX_CONCURRENT_SUMMARIES_PER_USER || '2', 10),
    nodeEnv,
    port: parseInt(env.PORT || '3001', 10),
    rootDir,
    summaryCacheVersion: 'summary-text-v1',
    summaryFormatBrief: 'brief',
    tmpDir: path.join(dataDir, 'tmp'),
    trashRetentionDays: parseInt(env.TRASH_RETENTION_DAYS || '30', 10),
    trustProxy: resolveTrustProxySetting(env.TRUST_PROXY, nodeEnv),
    uploadsDir: path.join(dataDir, 'uploads'),
  };
}

function getSessionCookieOptions(req, config, maxAge) {
  const isSecure = config.cookieSecureMode === 'always'
    ? true
    : config.cookieSecureMode === 'never'
      ? false
      : req.secure;

  const options = {
    httpOnly: true,
    path: '/',
  };

  if (isSecure) {
    options.secure = true;
    options.sameSite = 'none';
  } else {
    options.sameSite = 'lax';
  }

  if (config.cookieDomain) options.domain = config.cookieDomain;
  if (maxAge) options.maxAge = maxAge;
  return options;
}

module.exports = {
  getSessionCookieOptions,
  loadConfig,
  resolveTrustProxySetting,
};
