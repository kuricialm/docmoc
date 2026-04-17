const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createTagsRoutes({ authMiddleware, tagsService }) {
  const router = express.Router();

  router.get('/api/tags', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(tagsService.listTags(req.user.id));
  }));

  router.post('/api/tags', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(tagsService.createTag(req.user.id, req.body || {}));
  }));

  router.patch('/api/tags/:id', authMiddleware.auth, asyncHandler(async (req, res) => {
    tagsService.updateTag(req.params.id, req.user.id, req.body || {});
    res.json({ ok: true });
  }));

  router.delete('/api/tags/:id', authMiddleware.auth, asyncHandler(async (req, res) => {
    tagsService.deleteTag(req.params.id, req.user.id);
    res.json({ ok: true });
  }));

  router.post('/api/documents/:docId/tags/:tagId', authMiddleware.auth, asyncHandler(async (req, res) => {
    tagsService.addTagToDocument(req.params.docId, req.params.tagId, req.user.id);
    res.json({ ok: true });
  }));

  router.delete('/api/documents/:docId/tags/:tagId', authMiddleware.auth, asyncHandler(async (req, res) => {
    tagsService.removeTagFromDocument(req.params.docId, req.params.tagId, req.user.id);
    res.json({ ok: true });
  }));

  return router;
}

module.exports = {
  createTagsRoutes,
};
