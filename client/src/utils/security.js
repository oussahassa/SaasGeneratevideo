/**
 * Security Utilities - Base64 Encoding/Decoding
 * Provides secure encoding and decoding functions for API communication
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
    return btoa(unescape(encodeURIComponent(data)));
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
    const decoded = decodeURIComponent(escape(atob(base64Data)));

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
 * Secure API call wrapper with Base64 encoding
 * @param {Function} apiCall - API function to call
 * @param {object} params - Parameters to encode
 * @returns {Promise} API response
 */
export async function secureApiCall(apiCall, params = {}) {
  try {
    // Encode parameters
    const encodedParams = encodeToBase64(params);

    // Make API call with encoded parameters
    const response = await apiCall({ data: encodedParams });

    // Decode response
    if (response.data && response.data.encodedData) {
      response.data.data = decodeFromBase64(response.data.encodedData);
      delete response.data.encodedData;
    }

    return response;
  } catch (error) {
    console.error('Secure API call error:', error);
    throw error;
  }
}

/**
 * Create secure API headers
 * @param {string} token - Auth token
 * @returns {object} Headers object
 */
export function createSecureHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Security-Level': 'high',
    'X-Request-ID': generateRequestId(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['X-Auth-Token'] = encodeToBase64(token);
  }

  return headers;
}

/**
 * Generate unique request ID
 * @returns {string} Unique request ID
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate Base64 string
 * @param {string} str - String to validate
 * @returns {boolean} Is valid Base64
 */
export function isValidBase64(str) {
  try {
    return btoa(atob(str)) === str;
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

  // Remove whitespace and special characters
  return input.replace(/\s/g, '').replace(/[^a-zA-Z0-9+/=]/g, '');
}