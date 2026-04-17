const { notFound } = require('../errors/apiError.cjs');

function createBrandingService({ brandingStorage, settingsRepository }) {
  const settingKeys = {
    favicon: 'workspace_favicon_url',
    logo: 'workspace_logo_url',
  };

  function buildVersionedUrl(kind) {
    const storedBaseUrl = settingsRepository.getValue(settingKeys[kind]);
    if (!storedBaseUrl) return null;
    const asset = brandingStorage.getCurrentAsset(kind);
    if (!asset) return null;
    if (storedBaseUrl !== asset.baseUrl) {
      settingsRepository.setValue(settingKeys[kind], asset.baseUrl);
    }
    return `${asset.baseUrl}?v=${asset.version}`;
  }

  function upload(kind, file) {
    const asset = brandingStorage.saveAsset(kind, file.path, file.extension);
    settingsRepository.setValue(settingKeys[kind], asset.baseUrl);
    return {
      url: `${asset.baseUrl}?v=${asset.version}`,
    };
  }

  function remove(kind) {
    brandingStorage.removeAsset(kind);
    settingsRepository.delete(settingKeys[kind]);
  }

  return {
    getPublicBranding() {
      return {
        workspace_favicon_url: buildVersionedUrl('favicon'),
        workspace_logo_url: buildVersionedUrl('logo'),
      };
    },

    getPublicFaviconUrl() {
      return buildVersionedUrl('favicon');
    },

    getPublicLogoUrl() {
      return buildVersionedUrl('logo');
    },

    removeFavicon() {
      remove('favicon');
    },

    removeLogo() {
      remove('logo');
    },

    resolveAsset(kind, fileName) {
      const filePath = brandingStorage.resolveAssetFile(kind, fileName);
      if (!filePath) throw notFound('Not found');
      return filePath;
    },

    uploadFavicon(file) {
      return upload('favicon', file);
    },

    uploadLogo(file) {
      return upload('logo', file);
    },
  };
}

module.exports = {
  createBrandingService,
};
