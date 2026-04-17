const fs = require('fs');
const path = require('path');

function createDocumentFilesStorage(config) {
  function resolveAbsolutePath(storagePath) {
    return path.isAbsolute(storagePath) ? storagePath : path.join(config.dataDir, storagePath);
  }

  return {
    deleteStoredFile(storagePath) {
      const absolutePath = resolveAbsolutePath(storagePath);
      try {
        fs.unlinkSync(absolutePath);
      } catch (_) {
        return;
      }
      try {
        fs.rmdirSync(path.dirname(absolutePath));
      } catch (_) {}
    },

    getAbsolutePath(storagePath) {
      return resolveAbsolutePath(storagePath);
    },

    saveUploadedFile(userId, documentId, tempPath, extension) {
      const userDir = path.join(config.uploadsDir, userId);
      fs.mkdirSync(userDir, { recursive: true });
      const storagePath = `uploads/${userId}/${documentId}.${extension}`;
      const absolutePath = resolveAbsolutePath(storagePath);
      fs.renameSync(tempPath, absolutePath);
      return {
        absolutePath,
        storagePath,
      };
    },
  };
}

module.exports = {
  createDocumentFilesStorage,
};
