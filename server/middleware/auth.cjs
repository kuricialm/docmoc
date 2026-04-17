const { forbidden } = require('../errors/apiError.cjs');

function createAuthMiddleware({ authService }) {
  return {
    adminOnly(req, _res, next) {
      if (req.user.role !== 'admin') {
        next(forbidden('Admin only'));
        return;
      }
      next();
    },

    auth(req, _res, next) {
      try {
        req.user = authService.getAuthenticatedUserBySessionToken(req.cookies.session);
        next();
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = {
  createAuthMiddleware,
};
