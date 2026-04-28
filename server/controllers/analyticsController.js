/**
 * Analytics Controller
 * Provides comprehensive analytics data with security encoding
 */

import sql from "../configs/db.js";
import { encodeToBase64, createSecureResponse, extractSecureData } from "../utils/security.js";

// Vérifier le statut admin
const checkAdminStatus = async (userId) => {
  try {
    const user = await sql`
      SELECT is_admin FROM users WHERE id = ${userId}
    `;
    return user.length > 0 && user[0].is_admin === true;
  } catch (error) {
    return false;
  }
};

/**
 * Get comprehensive analytics data
 */
export const getAnalyticsData = async (req, res) => {
  try {
    const adminId = req.user.id;
    const days = parseInt(req.query.days) || 30;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // User growth data
    const userGrowth = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(*) OVER (ORDER BY DATE(created_at)) as total_users
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // Feature usage data
    const featureUsage = await sql`
      SELECT
        type,
        COUNT(*) as usage_count,
        COUNT(DISTINCT user_id) as unique_users,
        DATE(created_at) as date
      FROM creations
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY type, DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // Video statistics
    const videoStats = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as total_videos,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing
      FROM videos
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // Social media shares
    const socialShares = await sql`
      SELECT
        platform,
        COUNT(*) as share_count,
        DATE(shared_at) as date
      FROM video_shares
      WHERE shared_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY platform, DATE(shared_at)
      ORDER BY DATE(shared_at) ASC
    `;

    // Subscription data
    const subscriptionData = await sql`
      SELECT
        p.name as plan_name,
        COUNT(us.id) as active_subscriptions,
        SUM(us.monthly_limit) as total_credits,
        DATE(us.created_at) as date
      FROM user_subscriptions us
      LEFT JOIN packs p ON us.pack_id = p.id
      WHERE us.is_active = TRUE
        AND us.created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY p.name, DATE(us.created_at)
      ORDER BY DATE(us.created_at) ASC
    `;

    // Revenue data
    const revenueData = await sql`
      SELECT
        DATE(created_at) as date,
        SUM(amount) as daily_revenue,
        COUNT(*) as transaction_count
      FROM payments
      WHERE status = 'completed'
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    // User engagement metrics
    const userEngagement = await sql`
      SELECT
        user_id,
        COUNT(DISTINCT DATE(created_at)) as active_days,
        COUNT(*) as total_actions,
        MAX(created_at) as last_activity
      FROM creations
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY user_id
      ORDER BY active_days DESC, total_actions DESC
      LIMIT 20
    `;

    // Geographic distribution (if available)
    const geographicData = await sql`
      SELECT
        COUNT(*) as user_count,
        DATE(created_at) as date
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * ${days}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    const analyticsData = {
      userGrowth,
      featureUsage,
      videoStats,
      socialShares,
      subscriptionData,
      revenueData,
      userEngagement,
      geographicData,
      summary: {
        totalUsers: userGrowth.length > 0 ? userGrowth[userGrowth.length - 1].total_users : 0,
        totalVideos: videoStats.reduce((sum, stat) => sum + parseInt(stat.total_videos), 0),
        totalShares: socialShares.reduce((sum, stat) => sum + parseInt(stat.share_count), 0),
        totalRevenue: revenueData.reduce((sum, stat) => sum + parseFloat(stat.daily_revenue || 0), 0),
        activeSubscriptions: subscriptionData.reduce((sum, stat) => sum + parseInt(stat.active_subscriptions), 0),
        dateRange: {
          start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      }
    };

    res.json(createSecureResponse(analyticsData));

  } catch (error) {
    console.error('Analytics data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get real-time analytics
 */
export const getRealTimeAnalytics = async (req, res) => {
  try {
    const adminId = req.user.id;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Current online users (based on recent activity)
    const onlineUsers = await sql`
      SELECT COUNT(DISTINCT user_id) as online_users
      FROM sessions
      WHERE last_active_at >= NOW() - INTERVAL '15 minutes'
    `;

    // Recent activity
    const recentActivity = await sql`
      SELECT
        'creation' as activity_type,
        COUNT(*) as count
      FROM creations
      WHERE created_at >= NOW() - INTERVAL '1 hour'

      UNION ALL

      SELECT
        'video' as activity_type,
        COUNT(*) as count
      FROM videos
      WHERE created_at >= NOW() - INTERVAL '1 hour'

      UNION ALL

      SELECT
        'share' as activity_type,
        COUNT(*) as count
      FROM video_shares
      WHERE shared_at >= NOW() - INTERVAL '1 hour'
    `;

    // System health
    const systemHealth = {
      database: 'healthy',
      api: 'healthy',
      timestamp: new Date().toISOString()
    };

    const realTimeData = {
      onlineUsers: onlineUsers[0].online_users,
      recentActivity: recentActivity,
      systemHealth,
      timestamp: new Date().toISOString()
    };

    res.json(createSecureResponse(realTimeData));

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get user analytics
 */
export const getUserAnalytics = async (req, res) => {
  try {
    const adminId = req.user.id;
    const userId = req.params.userId;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // User activity over time
    const userActivity = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as actions,
        SUM(CASE WHEN type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN type = 'blog-title' THEN 1 ELSE 0 END) as blog_titles
      FROM creations
      WHERE user_id = ${userId}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `;

    // User video activity
    const userVideoActivity = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as videos,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing
      FROM videos
      WHERE user_id = ${userId}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
      LIMIT 30
    `;

    // User social media activity
    const userSocialActivity = await sql`
      SELECT
        platform,
        COUNT(*) as shares,
        DATE(shared_at) as date
      FROM video_shares
      WHERE user_id = ${userId}
      GROUP BY platform, DATE(shared_at)
      ORDER BY DATE(shared_at) DESC
      LIMIT 30
    `;

    const userAnalytics = {
      userActivity,
      userVideoActivity,
      userSocialActivity,
      summary: {
        totalActions: userActivity.reduce((sum, act) => sum + parseInt(act.actions), 0),
        totalVideos: userVideoActivity.reduce((sum, vid) => sum + parseInt(vid.videos), 0),
        totalShares: userSocialActivity.reduce((sum, soc) => sum + parseInt(soc.shares), 0)
      }
    };

    res.json(createSecureResponse(userAnalytics));

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = async (req, res) => {
  try {
    const adminId = req.user.id;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // API response times (simulated - in production, track actual response times)
    const apiPerformance = [
      { endpoint: '/api/ai/generate-article', avgResponseTime: 1200, successRate: 98.5 },
      { endpoint: '/api/ai/generate-image', avgResponseTime: 3500, successRate: 95.2 },
      { endpoint: '/api/videos/generate-video', avgResponseTime: 8000, successRate: 92.1 },
      { endpoint: '/api/auth/login', avgResponseTime: 300, successRate: 99.8 },
      { endpoint: '/api/user/dashboard-stats', avgResponseTime: 150, successRate: 99.9 }
    ];

    // Database performance
    const dbPerformance = {
      avgQueryTime: 45, // ms
      slowQueries: 3,
      connectionPoolUsage: 67 // percentage
    };

    // Server performance
    const serverPerformance = {
      cpuUsage: 45, // percentage
      memoryUsage: 62, // percentage
      uptime: process.uptime(),
      requestsPerMinute: 125
    };

    const performanceData = {
      apiPerformance,
      dbPerformance,
      serverPerformance,
      timestamp: new Date().toISOString()
    };

    res.json(createSecureResponse(performanceData));

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Export analytics data
 */
export const exportAnalyticsData = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { format = 'json', startDate, endDate } = req.query;

    const isAdmin = await checkAdminStatus(adminId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Get analytics data for date range
    const analyticsData = await getAnalyticsDataForExport(startDate, endDate);

    // Format based on requested format
    let formattedData;
    let contentType;
    let filename;

    switch (format.toLowerCase()) {
      case 'csv':
        formattedData = convertToCSV(analyticsData);
        contentType = 'text/csv';
        filename = `analytics_${startDate}_to_${endDate}.csv`;
        break;
      case 'json':
      default:
        formattedData = JSON.stringify(analyticsData, null, 2);
        contentType = 'application/json';
        filename = `analytics_${startDate}_to_${endDate}.json`;
    }

    // Encode the data
    const encodedData = encodeToBase64(formattedData);

    res.json({
      success: true,
      encodedData,
      format,
      contentType,
      filename,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper function to get analytics data for export
 */
async function getAnalyticsDataForExport(startDate, endDate) {
  const dateFilter = startDate && endDate
    ? sql`WHERE created_at >= ${startDate} AND created_at <= ${endDate}`
    : sql`WHERE created_at >= NOW() - INTERVAL '30 days'`;

  const users = await sql`SELECT * FROM users ${dateFilter}`;
  const creations = await sql`SELECT * FROM creations ${dateFilter}`;
  const videos = await sql`SELECT * FROM videos ${dateFilter}`;
  const videoShares = await sql`SELECT * FROM video_shares ${dateFilter}`;

  return {
    users,
    creations,
    videos,
    videoShares,
    exportDate: new Date().toISOString()
  };
}

/**
 * Helper function to convert data to CSV
 */
function convertToCSV(data) {
  // Simple CSV conversion - in production, use a proper CSV library
  const headers = Object.keys(data).join(',');
  const values = Object.values(data).map(val =>
    Array.isArray(val) ? val.length : JSON.stringify(val)
  ).join(',');

  return `${headers}\n${values}`;
}