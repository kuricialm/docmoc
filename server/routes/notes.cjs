const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createNotesRoutes({ authMiddleware, notesHistoryService }) {
  const router = express.Router();

  router.get('/api/documents/:id/note', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(notesHistoryService.getNote(req.params.id, req.user.id) || null);
  }));

  router.put('/api/documents/:id/note', authMiddleware.auth, asyncHandler(async (req, res) => {
    notesHistoryService.upsertNote(req.params.id, req.user.id, req.body?.content);
    res.json({ ok: true });
  }));

  router.get('/api/documents/:id/history', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(notesHistoryService.getHistory(req.params.id, req.user));
  }));

  return router;
}

module.exports = {
  createNotesRoutes,
};
