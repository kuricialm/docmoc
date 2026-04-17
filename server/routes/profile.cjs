const express = require('express');
const { getSessionCookieOptions } = require('../config/index.cjs');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createProfileRoutes({ authMiddleware, config, profileService }) {
  const router = express.Router();

  router.patch('/api/profile', authMiddleware.auth, asyncHandler(async (req, res) => {
    const updated = profileService.updateProfile(req.user.id, {
      accentColor: req.body?.accentColor,
      fullName: req.body?.fullName,
      workspaceLogoUrl: req.body?.workspaceLogoUrl,
    });
    res.json(updated);
  }));

  router.patch('/api/profile/password', authMiddleware.auth, asyncHandler(async (req, res) => {
    profileService.updatePassword(req.user.id, req.body?.newPassword);
    res.clearCookie('session', getSessionCookieOptions(req, config));
    res.json({ ok: true });
  }));

  router.patch('/api/profile/email', authMiddleware.auth, asyncHandler(async (req, res) => {
    profileService.updateEmail(req.user.id, req.body?.email);
    res.json({ ok: true });
  }));

  return router;
}

module.exports = {
  createProfileRoutes,
};
