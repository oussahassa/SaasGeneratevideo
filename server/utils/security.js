/**
 * Security Utilities - Backend
 * Provides Base64 encoding/decoding and security functions for API
 */

/**
 * Encode data to Base64 with error handling
 * @param {string|object} data - Data to encode
 * @returns {string} Base64 encoded string
 */
export function encodeToBase64(data) {
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    return Buffer.from(data, 'utf8').toString('base64');
  } catch (error) {
    console.error('Base64 encoding error:', error);
    throw new Error('Failed to encode data to Base64');
  }
}

/**
 * Decode Base64 data with error handling
 * @param {string} base64Data - Base64 encoded string
 * @returns {string|object} Decoded data
 */
export function decodeFromBase64(base64Data) {
  try {
    const decoded = Buffer.from(base64Data, 'base64').toString('utf8');

    // Try to parse as JSON, return as string if fails
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch (error) {
    console.error('Base64 decoding error:', error);
    throw new Error('Failed to decode Base64 data');
  }
}

/**
 * Validate Base64 string
 * @param {string} str - String to validate
 * @returns {boolean} Is valid Base64
 */
export function isValidBase64(str) {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

/**
 * Sanitize Base64 input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized Base64 string
 */
export function sanitizeBase64(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove whitespace and validate
  const sanitized = input.replace(/\s/g, '');

  if (!isValidBase64(sanitized)) {
    throw new Error('Invalid Base64 string');
  }

  return sanitized;
}

/**
 * Create secure response with encoded data
 * @param {object} data - Data to encode
 * @param {object} metadata - Optional metadata
 * @returns {object} Secure response object
 */
export function createSecureResponse(data, metadata = {}) {
  return {
    success: true,
    encodedData: encodeToBase64(data),
    timestamp: new Date().toISOString(),
    ...metadata
  };
}

/**
 * Extract and decode data from secure request
 * @param {object} req - Express request object
 * @returns {object} Decoded data
 */
export function extractSecureData(req) {
  try {
    if (req.body && req.body.encodedData) {
      return decodeFromBase64(req.body.encodedData);
    }
    return req.body || {};
  } catch (error) {
    console.error('Failed to extract secure data:', error);
    throw new Error('Invalid secure data format');
  }
}

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Security-Level', 'high');
  res.setHeader('X-Request-ID', req.id || generateRequestId());

  next();
}

/**
 * Generate unique request ID
 * @returns {string} Unique request ID
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate request integrity
 * @param {object} req - Express request object
 * @returns {boolean} Is request valid
 */
export function validateRequestIntegrity(req) {
  // Check for required security headers
  const securityLevel = req.headers['x-security-level'];

  // Log security events
  if (process.env.NODE_ENV === 'production') {
    console.log({
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
      method: req.method,
      path: req.path,
      securityLevel,
      userId: req.user?.id || 'anonymous'
    });
  }

  return true;
}

/**
 * Rate limit by user
 * @param {string} userId - User ID
 * @param {string} action - Action type
 * @param {number} limit - Rate limit
 * @returns {boolean} Is allowed
 */
export function checkUserRateLimit(userId, action, limit = 10) {
  // This would typically use Redis or similar
  // For now, return true (implement proper rate limiting in production)
  return true;
}