// @vitest-environment node
const Database = require('better-sqlite3');
const { createSettingsRepository } = require('../repositories/settings.cjs');
const { createSettingsService } = require('./settings.cjs');

function makeService() {
  const db = new Database(':memory:');
  db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)');

  const settingsRepository = createSettingsRepository(db);
  const settingsService = createSettingsService({
    brandingService: {
      getPublicBranding() {
        return {
          workspace_logo_url: null,
          workspace_favicon_url: null,
        };
      },
    },
    settingsRepository,
  });

  return { db, settingsRepository, settingsService };
}

describe('settingsService', () => {
  it('returns trash retention as a number and persists valid updates', () => {
    const { db, settingsRepository, settingsService } = makeService();

    settingsRepository.setMany({
      registration_enabled: true,
      trash_retention_days: 30,
    });

    expect(settingsService.getPublicSettings()).toMatchObject({
      registration_enabled: true,
      trash_retention_days: 30,
      workspace_favicon_url: null,
      workspace_logo_url: null,
    });

    settingsService.updateSettings({ trash_retention_days: 45 });

    expect(settingsRepository.getValue('trash_retention_days')).toBe('45');
    expect(settingsService.getTrashRetentionDays()).toBe(45);

    db.close();
  });

  it('rejects invalid trash retention values', () => {
    const { db, settingsService } = makeService();

    expect(() => settingsService.updateSettings({ trash_retention_days: '' })).toThrow(/whole number/);
    expect(() => settingsService.updateSettings({ trash_retention_days: 'abc' })).toThrow(/whole number/);
    expect(() => settingsService.updateSettings({ trash_retention_days: '1.5' })).toThrow(/whole number/);
    expect(() => settingsService.updateSettings({ trash_retention_days: -1 })).toThrow(/whole number/);

    db.close();
  });
});
