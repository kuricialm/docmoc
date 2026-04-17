function createSettingsService({ brandingService, settingsRepository }) {
  function coerceSettingValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    return value;
  }

  return {
    getPublicSettings() {
      const settings = {};
      for (const row of settingsRepository.getAll()) {
        settings[row.key] = coerceSettingValue(row.value);
      }
      return {
        ...settings,
        ...brandingService.getPublicBranding(),
      };
    },

    isRegistrationEnabled() {
      return settingsRepository.getValue('registration_enabled') === 'true';
    },

    updateSettings(values) {
      settingsRepository.setMany(values);
      return this.getPublicSettings();
    },
  };
}

module.exports = {
  createSettingsService,
};
