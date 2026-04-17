const multer = require('multer');

function createUploadMiddleware(config) {
  return multer({ dest: config.tmpDir });
}

module.exports = {
  createUploadMiddleware,
};
