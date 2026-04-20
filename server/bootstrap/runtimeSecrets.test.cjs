// @vitest-environment node
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  bootstrapRuntimeSecrets,
  readRuntimeSecrets,
} = require('./runtimeSecrets.cjs');

const tempDirs = [];

function makeTempDir(prefix = 'docmoc-runtime-secrets-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { force: true, recursive: true });
  }
});

describe('bootstrapRuntimeSecrets', () => {
  it('generates and persists missing production secrets on first start', () => {
    const dataDir = makeTempDir();
    const result = bootstrapRuntimeSecrets({
      DATA_DIR: dataDir,
      NODE_ENV: 'production',
    });

    expect(result).toBeTruthy();
    expect(result.secrets.COOKIE_SECRET).toMatch(/^[a-f0-9]{64}$/);
    expect(result.secrets.AI_SECRETS_MASTER_KEY).toMatch(/^[a-f0-9]{64}$/);
    expect(readRuntimeSecrets(result.filePath)).toEqual(result.secrets);
    expect(fs.statSync(result.filePath).mode & 0o777).toBe(0o600);
  });

  it('reuses persisted secrets on restart', () => {
    const dataDir = makeTempDir();
    const first = bootstrapRuntimeSecrets({
      DATA_DIR: dataDir,
      NODE_ENV: 'production',
    });

    const secondEnv = {
      DATA_DIR: dataDir,
      NODE_ENV: 'production',
    };
    const second = bootstrapRuntimeSecrets(secondEnv);

    expect(second.secrets).toEqual(first.secrets);
    expect(secondEnv.COOKIE_SECRET).toBe(first.secrets.COOKIE_SECRET);
    expect(secondEnv.AI_SECRETS_MASTER_KEY).toBe(first.secrets.AI_SECRETS_MASTER_KEY);
  });

  it('prefers explicit non-placeholder env secrets over persisted values', () => {
    const dataDir = makeTempDir();
    const first = bootstrapRuntimeSecrets({
      DATA_DIR: dataDir,
      NODE_ENV: 'production',
    });

    const env = {
      AI_SECRETS_MASTER_KEY: 'b'.repeat(64),
      COOKIE_SECRET: 'a'.repeat(64),
      DATA_DIR: dataDir,
      NODE_ENV: 'production',
    };
    const second = bootstrapRuntimeSecrets(env);

    expect(second.secrets).toEqual({
      AI_SECRETS_MASTER_KEY: 'b'.repeat(64),
      COOKIE_SECRET: 'a'.repeat(64),
    });
    expect(readRuntimeSecrets(second.filePath)).toEqual(second.secrets);
    expect(second.secrets).not.toEqual(first.secrets);
  });
});
