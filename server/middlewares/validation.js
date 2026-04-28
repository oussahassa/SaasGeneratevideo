/**
 * Input Validation Middleware
 * Provides validation and sanitization for user inputs
 */

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate and sanitize video generation parameters
 */
export const validateVideoParams = (req, res, next) => {
  const { topic, duration, tone } = req.body;

  // Validate topic
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required and must be a non-empty string'
    });
  }

  if (topic.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Topic must be less than 500 characters'
    });
  }

  // Validate duration
  const durationNum = parseInt(duration);
  if (isNaN(durationNum) || durationNum < 15 || durationNum > 300) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be between 15 and 300 seconds'
    });
  }

  // Validate tone
  const validTones = ['professional', 'casual', 'funny', 'educational', 'inspirational'];
  if (!tone || !validTones.includes(tone)) {
    return res.status(400).json({
      success: false,
      message: `Tone must be one of: ${validTones.join(', ')}`
    });
  }

  // Sanitize inputs
  req.body.topic = sanitizeString(topic);
  req.body.duration = durationNum;
  req.body.tone = tone;

  next();
};

/**
 * Validate social sharing parameters
 */
export const validateShareParams = (req, res, next) => {
  const { videoId, platforms, caption } = req.body;

  // Validate video ID
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Video ID is required'
    });
  }

  // Validate platforms
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one platform must be selected'
    });
  }

  const validPlatforms = ['instagram', 'tiktok', 'facebook'];
  const invalidPlatforms = platforms.filter(p => !validPlatforms.includes(p));

  if (invalidPlatforms.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid platforms: ${invalidPlatforms.join(', ')}`
    });
  }

  // Validate caption
  if (!caption || typeof caption !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Caption is required'
    });
  }

  if (caption.length > 2200) {
    return res.status(400).json({
      success: false,
      message: 'Caption must be less than 2200 characters'
    });
  }

  // Sanitize caption
  req.body.caption = sanitizeString(caption);

  next();
};

/**
 * Validate ID parameter
 */
export const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: `Valid ${paramName} is required`
      });
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

/**
 * Request body size limiter
 */
export const validateBodySize = (maxSize = 10 * 1024 * 1024) => { // 10MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Request body too large'
      });
    }

    next();
  };
};