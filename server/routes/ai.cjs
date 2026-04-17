const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createAiRoutes({ authMiddleware, openRouterService }) {
  const router = express.Router();

  router.get('/api/profile/ai/openrouter', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(openRouterService.buildOpenRouterResponse(req.user.id));
  }));

  router.post('/api/profile/ai/openrouter-key', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(await openRouterService.saveKey(req.user.id, req.body?.apiKey));
  }));

  router.delete('/api/profile/ai/openrouter-key', authMiddleware.auth, asyncHandler(async (req, res) => {
    openRouterService.removeKey(req.user.id);
    res.json({ ok: true });
  }));

  router.patch('/api/profile/ai/openrouter/preferences', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(openRouterService.savePreferences(req.user.id, req.body || {}));
  }));

  router.post('/api/profile/ai/openrouter/models/refresh', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(await openRouterService.refreshModels(req.user.id));
  }));

  router.post('/api/profile/ai/openrouter/backfill', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(await openRouterService.queueMissingSummaries(req.user.id));
  }));

  router.post('/api/profile/ai/openrouter/regenerate-all', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(openRouterService.regenerateAllSummaries(req.user.id));
  }));

  return router;
}

module.exports = {
  createAiRoutes,
};
