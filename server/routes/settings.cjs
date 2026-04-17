const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createSettingsRoutes({ authMiddleware, settingsService }) {
  const router = express.Router();

  router.get('/api/settings', asyncHandler(async (_req, res) => {
    res.json(settingsService.getPublicSettings());
  }));

  router.patch('/api/settings', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (req, res) => {
    settingsService.updateSettings(req.body || {});
    res.json({ ok: true });
  }));

  return router;
}

module.exports = {
  createSettingsRoutes,
};
