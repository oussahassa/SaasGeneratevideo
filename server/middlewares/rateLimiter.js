/**
 * Rate Limiting Middleware
 * Protects against brute force attacks and API abuse
 */

const rateLimit = new Map();

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_CONFIG = {
  // General API limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP, please try again later.'
  },
  // Strict limits for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many attempts, please try again later.'
  },
  // Auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    message: 'Too many authentication attempts, please try again later.'
  }
};

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (value.resetTime <= now) {
      rateLimit.delete(key);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupRateLimits, 60 * 1000);

/**
 * Rate limiter middleware factory
 * @param {string} type - Type of rate limit ('general', 'strict', 'auth')
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (type = 'general') => {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.general;

  return (req, res, next) => {
    const key = `${req.ip}-${type}`;
    const now = Date.now();

    // Get or create rate limit entry
    let limitData = rateLimit.get(key);

    if (!limitData || limitData.resetTime <= now) {
      // Create new rate limit entry
      limitData = {
        count: 0,
        resetTime: now + config.windowMs
      };
      rateLimit.set(key, limitData);
    }

    // Increment counter
    limitData.count++;

    // Check if limit exceeded
    if (limitData.count > config.maxRequests) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);

      return res.status(429).json({
        success: false,
        message: config.message,
        retryAfter: `${retryAfter} seconds`,
        status: 429
      });
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', config.maxRequests - limitData.count);
    res.setHeader('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());

    next();
  };
};

/**
 * Pre-configured rate limiters
 */
export const generalRateLimiter = createRateLimiter('general');
export const strictRateLimiter = createRateLimiter('strict');
export const authRateLimiter = createRateLimiter('auth');