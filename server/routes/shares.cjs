const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createShareRoutes({ authMiddleware, sharedService }) {
  const router = express.Router();

  router.patch('/api/documents/:id/share', authMiddleware.auth, asyncHandler(async (req, res) => {
    res.json(sharedService.updateShare(req.params.id, req.user.id, req.body?.shared, req.body?.config));
  }));

  return router;
}

module.exports = {
  createShareRoutes,
};
