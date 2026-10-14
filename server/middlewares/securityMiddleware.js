/**
 * Security Middleware
 * Automatically applies Base64 encoding/decoding to API requests and responses
 */

import { encodeToBase64, decodeFromBase64, createSecureResponse, extractSecureData } from '../utils/security.js';

/**
 * Middleware to automatically decode Base64 request data
 */
export const autoDecodeRequest = (req, res, next) => {
  try {
    // Check if request contains encoded data
    if (req.body && req.body.encodedData) {
      req.decodedData = extractSecureData(req);
      console.log('Decoded secure request data');
    } else {
      req.decodedData = req.body;
    }
    next();
  } catch (error) {
    console.error('Request decoding error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid request data format'
    });
  }
};

/**
 * Middleware to automatically encode Base64 response data
 */
export const autoEncodeResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    try {
      // Check if response should be encoded
      const shouldEncode = req.headers['x-encode-response'] === 'true';

      if (shouldEncode && data && !data.encodedData) {
        // Encode the response data
        const encodedData = encodeToBase64(data);
        data = createSecureResponse(data);
      }

      return originalJson.call(this, data);
    } catch (error) {
      console.error('Response encoding error:', error);
      return originalJson.call(this, data);
    }
  };

  next();
};

/**
 * Middleware to enforce security on sensitive endpoints
 */
export const enforceSecurity = (req, res, next) => {
  // Check for required security headers
  const securityLevel = req.headers['x-security-level'];

  if (!securityLevel || securityLevel !== 'high') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient security level'
    });
  }

  // Validate request integrity
  const requestId = req.headers['x-request-id'];
  if (!requestId) {
    return res.status(400).json({
      success: false,
      message: 'Missing request ID'
    });
  }

  // Add request ID to request object for tracking
  req.id = requestId;

  next();
};

/**
 * Middleware to log security events
 */
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log({
    type: 'security_request',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'],
    method: req.method,
    path: req.path,
    securityLevel: req.headers['x-security-level'],
    userId: req.user?.id || 'anonymous',
    ip: req.ip || req.connection?.remoteAddress
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log({
      type: 'security_response',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous'
    });
  });

  next();
};

/**
 * Middleware to validate Base64 data integrity
 */
export const validateBase64Integrity = (req, res, next) => {
  try {
    if (req.body && req.body.encodedData) {
      // Validate Base64 format
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      if (!base64Regex.test(req.body.encodedData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Base64 format'
        });
      }

      // Try to decode to ensure integrity
      try {
        const decoded = decodeFromBase64(req.body.encodedData);
        req.validatedData = decoded;
      } catch (decodeError) {
        return res.status(400).json({
          success: false,
          message: 'Corrupted Base64 data'
        });
      }
    }
    next();
  } catch (error) {
    console.error('Base64 validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed'
    });
  }
};

/**
 * Apply all security middleware
 */
export const applySecurity = [
  securityLogger,
  autoDecodeRequest,
  validateBase64Integrity,
  autoEncodeResponse
];