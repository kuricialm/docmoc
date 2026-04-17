const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createSharedRoutes({ sharedService }) {
  const router = express.Router();

  router.get('/api/shared/:token', asyncHandler(async (req, res) => {
    res.json(sharedService.getSharedDocument(req.params.token, typeof req.query.password === 'string' ? req.query.password : ''));
  }));

  router.get('/api/shared/:token/download', asyncHandler(async (req, res) => {
    const file = sharedService.getSharedDownload(req.params.token, typeof req.query.password === 'string' ? req.query.password : '');
    res.setHeader('Content-Type', file.contentType);
    res.sendFile(file.filePath);
  }));

  return router;
}

module.exports = {
  createSharedRoutes,
};
