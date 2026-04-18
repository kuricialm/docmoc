const { badRequest } = require('../errors/apiError.cjs');

function createSettingsService({ brandingService, settingsRepository }) {
  function normalizeStoredSetting(key, value) {
    if (key === 'trash_retention_days') {
      const parsed = Number.parseInt(String(value), 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : 30;
    }

    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    return value;
  }

  function coerceSettingValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    return value;
  }

  function parseTrashRetentionDays(value) {
    if (typeof value === 'number') {
      if (!Number.isInteger(value) || value < 1) {
        throw badRequest('Trash retention must be a whole number of at least 1 day');
      }
      return value;
    }

    if (typeof value !== 'string') {
      throw badRequest('Trash retention must be a whole number of at least 1 day');
    }

    const trimmed = value.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      throw badRequest('Trash retention must be a whole number of at least 1 day');
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      throw badRequest('Trash retention must be a whole number of at least 1 day');
    }

    return parsed;
  }

  return {
    getPublicSettings() {
      const settings = {};
      for (const row of settingsRepository.getAll()) {
        settings[row.key] = normalizeStoredSetting(row.key, row.value);
      }
      return {
        trash_retention_days: 30,
        ...settings,
        ...brandingService.getPublicBranding(),
      };
    },

    isRegistrationEnabled() {
      return settingsRepository.getValue('registration_enabled') === 'true';
    },

    getTrashRetentionDays() {
      const value = settingsRepository.getValue('trash_retention_days');
      return value ? parseTrashRetentionDays(value) : 30;
    },

    updateSettings(values) {
      const updates = {};

      if (Object.prototype.hasOwnProperty.call(values || {}, 'registration_enabled')) {
        updates.registration_enabled = coerceSettingValue(values.registration_enabled) === true;
      }

      if (Object.prototype.hasOwnProperty.call(values || {}, 'trash_retention_days')) {
        updates.trash_retention_days = parseTrashRetentionDays(values.trash_retention_days);
      }

      if (Object.keys(updates).length === 0) {
        throw badRequest('No valid settings changes provided');
      }

      settingsRepository.setMany(updates);
      return this.getPublicSettings();
    },
  };
}

module.exports = {
  createSettingsService,
};
