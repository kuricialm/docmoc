const fs = require('fs');
const path = require('path');

function createBrandingStorage(config) {
  function getCanonicalFaviconFileName() {
    return 'workspace.ico';
  }

  function getDirectory(kind) {
    return path.join(config.dataDir, kind === 'logo' ? 'logos' : 'favicons');
  }

  function getRouteBase(kind) {
    return kind === 'logo' ? '/api/profile/logo' : '/api/profile/favicon';
  }

  function ensureDirectory(kind) {
    fs.mkdirSync(getDirectory(kind), { recursive: true });
  }

  function clearDirectory(kind) {
    const directory = getDirectory(kind);
    if (!fs.existsSync(directory)) return;
    for (const fileName of fs.readdirSync(directory)) {
      fs.rmSync(path.join(directory, fileName), { force: true });
    }
  }

  function resolveLegacyFaviconAlias(fileName) {
    if (!fileName) return null;
    if (/^workspace\.(x-icon|vnd\.microsoft\.icon)$/i.test(fileName)) {
      return getCanonicalFaviconFileName();
    }
    return null;
  }

  function normalizeLegacyFaviconFiles(directory) {
    const fileNames = fs.readdirSync(directory);
    const legacyFileName = fileNames.find((fileName) => /^workspace\.(x-icon|vnd\.microsoft\.icon)$/i.test(fileName));
    if (!legacyFileName) return;

    const canonicalFileName = getCanonicalFaviconFileName();
    const legacyPath = path.join(directory, legacyFileName);
    const canonicalPath = path.join(directory, canonicalFileName);

    if (legacyPath === canonicalPath) return;
    if (fs.existsSync(canonicalPath)) {
      fs.rmSync(legacyPath, { force: true });
      return;
    }
    fs.renameSync(legacyPath, canonicalPath);
  }

  function getCurrentAsset(kind) {
    const directory = getDirectory(kind);
    if (!fs.existsSync(directory)) return null;
    if (kind === 'favicon') normalizeLegacyFaviconFiles(directory);
    const fileName = fs.readdirSync(directory).sort()[0];
    if (!fileName) return null;
    const filePath = path.join(directory, fileName);
    const stats = fs.statSync(filePath);
    return {
      baseUrl: `${getRouteBase(kind)}/${fileName}`,
      fileName,
      filePath,
      version: Math.floor(stats.mtimeMs),
    };
  }

  return {
    getCurrentAsset,

    removeAsset(kind) {
      clearDirectory(kind);
    },

    resolveAssetFile(kind, fileName) {
      const filePath = path.join(getDirectory(kind), fileName);
      if (fs.existsSync(filePath)) return filePath;
      if (kind !== 'favicon') return null;
      const alias = resolveLegacyFaviconAlias(fileName);
      if (!alias) return null;
      const aliasPath = path.join(getDirectory(kind), alias);
      return fs.existsSync(aliasPath) ? aliasPath : null;
    },

    saveAsset(kind, tempPath, extension) {
      ensureDirectory(kind);
      clearDirectory(kind);
      const fileName = `workspace.${extension}`;
      const destination = path.join(getDirectory(kind), fileName);
      fs.renameSync(tempPath, destination);
      return getCurrentAsset(kind);
    },
  };
}

module.exports = {
  createBrandingStorage,
};
