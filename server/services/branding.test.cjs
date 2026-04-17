// @vitest-environment node
const fs = require('fs');
const os = require('os');
const path = require('path');
const Database = require('better-sqlite3');
const { createBrandingService } = require('./branding.cjs');
const { createSettingsRepository } = require('../repositories/settings.cjs');
const { createBrandingStorage } = require('../storage/brandingAssets.cjs');

const tempDirs = [];

function makeTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docmoc-branding-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { force: true, recursive: true });
  }
});

describe('createBrandingService', () => {
  it('returns versioned branding URLs from stored assets', () => {
    const dataDir = makeTempDir();
    const db = new Database(':memory:');
    db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)');

    const logoDir = path.join(dataDir, 'logos');
    const faviconDir = path.join(dataDir, 'favicons');
    fs.mkdirSync(logoDir, { recursive: true });
    fs.mkdirSync(faviconDir, { recursive: true });
    fs.writeFileSync(path.join(logoDir, 'workspace.png'), 'logo');
    fs.writeFileSync(path.join(faviconDir, 'workspace.ico'), 'icon');

    const settingsRepository = createSettingsRepository(db);
    settingsRepository.setValue('workspace_logo_url', '/api/profile/logo/workspace.png');
    settingsRepository.setValue('workspace_favicon_url', '/api/profile/favicon/workspace.ico');

    const brandingService = createBrandingService({
      brandingStorage: createBrandingStorage({ dataDir }),
      settingsRepository,
    });

    const branding = brandingService.getPublicBranding();
    expect(branding.workspace_logo_url).toMatch(/^\/api\/profile\/logo\/workspace\.png\?v=\d+$/);
    expect(branding.workspace_favicon_url).toMatch(/^\/api\/profile\/favicon\/workspace\.ico\?v=\d+$/);

    db.close();
  });

  it('normalizes legacy favicon filenames to canonical ico URLs', () => {
    const dataDir = makeTempDir();
    const db = new Database(':memory:');
    db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)');

    const faviconDir = path.join(dataDir, 'favicons');
    fs.mkdirSync(faviconDir, { recursive: true });
    fs.writeFileSync(path.join(faviconDir, 'workspace.x-icon'), 'icon');

    const settingsRepository = createSettingsRepository(db);
    settingsRepository.setValue('workspace_favicon_url', '/api/profile/favicon/workspace.x-icon');

    const brandingService = createBrandingService({
      brandingStorage: createBrandingStorage({ dataDir }),
      settingsRepository,
    });

    const faviconUrl = brandingService.getPublicFaviconUrl();
    expect(faviconUrl).toMatch(/^\/api\/profile\/favicon\/workspace\.ico\?v=\d+$/);
    expect(settingsRepository.getValue('workspace_favicon_url')).toBe('/api/profile/favicon/workspace.ico');
    expect(fs.existsSync(path.join(faviconDir, 'workspace.ico'))).toBe(true);
    expect(fs.existsSync(path.join(faviconDir, 'workspace.x-icon'))).toBe(false);

    db.close();
  });
});
