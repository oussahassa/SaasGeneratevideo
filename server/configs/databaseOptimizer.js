/**
 * Database Optimization Utilities
 * Provides optimized database query helpers and caching strategies
 */

import sql from './db.js';

/**
 * Query result cache
 */
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached query result
 */
function getCachedResult(cacheKey) {
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  return null;
}

/**
 * Set cached query result
 */
function setCachedResult(cacheKey, data) {
  queryCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL
  });
}

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (value.expiresAt <= now) {
      queryCache.delete(key);
    }
  }
}

// Run cache cleanup every 60 minute
setInterval(clearExpiredCache, 60 * 60 * 1000);

/**
 * Execute query with caching
 */
export async function cachedQuery(cacheKey, queryFn) {
  // Try to get from cache first
  const cached = getCachedResult(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Execute query
  const result = await queryFn();

  // Cache the result
  setCachedResult(cacheKey, result);

  return result;
}

/**
 * Clear cache for specific key pattern
 */
export function clearCachePattern(pattern) {
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
}

/**
 * Optimized user data fetch with caching
 */
export async function getUserData(userId) {
  const cacheKey = `user_${userId}`;
  return cachedQuery(cacheKey, async () => {
    const users = await sql`
      SELECT id, email, first_name, last_name, profile_picture, is_admin, credit, created_at
      FROM users
      WHERE id = ${userId}
    `;
    return users[0] || null;
  });
}

/**
 * Optimized subscription data fetch with caching
 */
export async function getUserSubscription(userId) {
  const cacheKey = `subscription_${userId}`;
  return cachedQuery(cacheKey, async () => {
    const subscriptions = await sql`
      SELECT * FROM user_subscriptions
      WHERE user_id = ${userId} AND is_active = TRUE AND end_date > NOW()
      ORDER BY end_date DESC
      LIMIT 1
    `;
    return subscriptions[0] || null;
  });
}

/**
 * Batch video fetch with pagination
 */
export async function getVideosWithPagination(userId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const cacheKey = `videos_${userId}_page_${page}_limit_${limit}`;

  return cachedQuery(cacheKey, async () => {
    const videos = await sql`
      SELECT * FROM videos
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return videos;
  });
}

/**
 * Get video statistics with caching
 */
export async function getVideoStatistics(userId) {
  const cacheKey = `video_stats_${userId}`;

  return cachedQuery(cacheKey, async () => {
    const result = await sql`
      SELECT
        COUNT(*) as total_videos,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_videos,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_videos,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_videos
      FROM videos
      WHERE user_id = ${userId}
    `;
    return result[0] || {};
  });
}

/**
 * Optimized social accounts fetch
 */
export async function getSocialAccounts(userId) {
  const cacheKey = `social_accounts_${userId}`;

  return cachedQuery(cacheKey, async () => {
    const accounts = await sql`
      SELECT id, platform, platform_user_id, page_id, page_name, created_at, updated_at
      FROM social_accounts
      WHERE user_id = ${userId}
    `;
    return accounts;
  });
}

/**
 * Clear user-specific cache
 */
export function clearUserCache(userId) {
  clearCachePattern(`user_${userId}`);
  clearCachePattern(`subscription_${userId}`);
  clearCachePattern(`videos_${userId}`);
  clearCachePattern(`video_stats_${userId}`);
  clearCachePattern(`social_accounts_${userId}`);
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    return {
      healthy: true,
      timestamp: result[0].current_time
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}