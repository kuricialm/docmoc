// @vitest-environment node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createApp } = require('./createApp.cjs');
const { createContext } = require('../bootstrap/createContext.cjs');
const { DEFAULT_BOOTSTRAP_ADMIN_PASSWORD } = require('../bootstrap/runtimeSecrets.cjs');

const tempDirs = [];

function makeTempDir(prefix = 'docmoc-auth-flags-') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

async function startTestServer({
  adminPassword = DEFAULT_BOOTSTRAP_ADMIN_PASSWORD,
} = {}) {
  const dataDir = makeTempDir();
  const context = createContext({
    ADMIN_EMAIL: 'admin@docmoc.local',
    ADMIN_PASSWORD: adminPassword,
    AI_SECRETS_MASTER_KEY: 'test-ai-secret',
    COOKIE_SECRET: 'test-cookie-secret',
    DATA_DIR: dataDir,
    HOME: dataDir,
    NODE_ENV: 'production',
    PORT: '0',
  });
  const app = createApp(context);
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  async function close() {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    context.db.close();
  }

  return {
    baseUrl,
    close,
  };
}

async function signIn(baseUrl, password = DEFAULT_BOOTSTRAP_ADMIN_PASSWORD) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    body: JSON.stringify({
      email: 'admin@docmoc.local',
      password,
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  return {
    body: response.headers.get('content-type')?.includes('application/json') ? await response.json() : null,
    cookie: response.headers.get('set-cookie')?.split(';')[0] || '',
    response,
  };
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { force: true, recursive: true });
  }
});

describe('auth default-password flags', () => {
  it('returns the default-password flag from login, session, and me for the bootstrap admin', async () => {
    const runtime = await startTestServer();

    try {
      const signedIn = await signIn(runtime.baseUrl);
      expect(signedIn.response.status).toBe(200);
      expect(signedIn.body).toMatchObject({
        is_using_default_admin_password: true,
      });

      const sessionResponse = await fetch(`${runtime.baseUrl}/api/auth/session`, {
        headers: { Cookie: signedIn.cookie },
      });
      expect(sessionResponse.status).toBe(200);
      await expect(sessionResponse.json()).resolves.toMatchObject({
        user: {
          is_using_default_admin_password: true,
        },
      });

      const meResponse = await fetch(`${runtime.baseUrl}/api/auth/me`, {
        headers: { Cookie: signedIn.cookie },
      });
      expect(meResponse.status).toBe(200);
      await expect(meResponse.json()).resolves.toMatchObject({
        is_using_default_admin_password: true,
      });
    } finally {
      await runtime.close();
    }
  });

  it('clears the default-password flag after the admin changes their password', async () => {
    const runtime = await startTestServer();

    try {
      const signedIn = await signIn(runtime.baseUrl);
      expect(signedIn.response.status).toBe(200);

      const changePasswordResponse = await fetch(`${runtime.baseUrl}/api/profile/password`, {
        body: JSON.stringify({ newPassword: 'better-password-123' }),
        headers: {
          'Content-Type': 'application/json',
          Cookie: signedIn.cookie,
          Origin: runtime.baseUrl,
        },
        method: 'PATCH',
      });
      expect(changePasswordResponse.status).toBe(200);

      const signedInAgain = await signIn(runtime.baseUrl, 'better-password-123');
      expect(signedInAgain.response.status).toBe(200);
      expect(signedInAgain.body).toMatchObject({
        is_using_default_admin_password: false,
      });
    } finally {
      await runtime.close();
    }
  });

  it('keeps the flag off when the deployment uses a custom admin password', async () => {
    const runtime = await startTestServer({
      adminPassword: 'custom-password-123',
    });

    try {
      const signedIn = await signIn(runtime.baseUrl, 'custom-password-123');
      expect(signedIn.response.status).toBe(200);
      expect(signedIn.body).toMatchObject({
        is_using_default_admin_password: false,
      });
    } finally {
      await runtime.close();
    }
  });
});
