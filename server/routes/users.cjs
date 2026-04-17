const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler.cjs');

function createUsersRoutes({ authMiddleware, usersService }) {
  const router = express.Router();

  router.get('/api/users', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (_req, res) => {
    res.json(usersService.listUsers());
  }));

  router.post('/api/users', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (req, res) => {
    res.json(usersService.createUser({
      email: req.body?.email,
      fullName: req.body?.fullName,
      password: req.body?.password,
      role: req.body?.role,
    }));
  }));

  router.patch('/api/users/:id/role', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (req, res) => {
    usersService.updateUser(req.params.id, { role: req.body?.role });
    res.json({ ok: true });
  }));

  router.patch('/api/users/:id', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (req, res) => {
    usersService.updateUser(req.params.id, {
      email: req.body?.email,
      fullName: req.body?.fullName,
      role: req.body?.role,
      suspended: req.body?.suspended,
      uploadQuotaBytes: req.body?.uploadQuotaBytes,
    });
    res.json({ ok: true });
  }));

  router.patch('/api/users/:id/password', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (req, res) => {
    usersService.updateUserPassword(req.params.id, req.body?.newPassword);
    res.json({ ok: true });
  }));

  router.delete('/api/users/:id', authMiddleware.auth, authMiddleware.adminOnly, asyncHandler(async (req, res) => {
    usersService.deleteUser(req.params.id, req.user.id);
    res.json({ ok: true });
  }));

  return router;
}

module.exports = {
  createUsersRoutes,
};
