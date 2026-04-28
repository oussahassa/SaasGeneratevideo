/**
 * Error Handling Middleware
 * Provides consistent error handling and logging across the application
 */

export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    ip: req.ip || req.connection?.remoteAddress
  });

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = err.message;
    error.status = 400;
  } else if (err.name === 'UnauthorizedError') {
    error.message = 'Unauthorized access';
    error.status = 401;
  } else if (err.code === '23505') { // PostgreSQL unique violation
    error.message = 'Resource already exists';
    error.status = 409;
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    error.message = 'Referenced resource does not exist';
    error.status = 404;
  }

  // Don't leak stack traces in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  res.status(error.status).json(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 * Handles 404 errors for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    status: 404
  });
};