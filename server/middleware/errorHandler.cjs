const { ApiError } = require('../errors/apiError.cjs');

function asyncHandler(fn) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function errorHandler(err, _req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: err.message,
      ...err.payload,
    });
    return;
  }

  console.error('[api] unhandled error', err);
  res.status(err?.status || 500).json({
    error: err?.message || 'Internal server error',
  });
}

module.exports = {
  asyncHandler,
  errorHandler,
};
