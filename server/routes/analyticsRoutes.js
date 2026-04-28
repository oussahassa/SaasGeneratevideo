/**
 * Analytics Routes
 * Provides secure API endpoints for analytics data
 */

import express from 'express';
import { auth } from '../middlewares/auth.js';
import { validateIdParam } from '../middlewares/validation.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { securityHeaders } from '../utils/security.js';
import {
  getAnalyticsData,
  getRealTimeAnalytics,
  getUserAnalytics,
  getPerformanceMetrics,
  exportAnalyticsData
} from '../controllers/analyticsController.js';

const analyticsRouter = express.Router();

// Apply security headers to all routes
analyticsRouter.use(securityHeaders);

// All analytics routes require authentication and admin access
analyticsRouter.use(auth);

/**
 * Get comprehensive analytics data
 * GET /api/analytics/dashboard
 * Query params: days (number, default: 30)
 */
analyticsRouter.get('/dashboard', asyncHandler(getAnalyticsData));

/**
 * Get real-time analytics
 * GET /api/analytics/realtime
 */
analyticsRouter.get('/realtime', asyncHandler(getRealTimeAnalytics));

/**
 * Get user-specific analytics
 * GET /api/analytics/user/:userId
 */
analyticsRouter.get('/user/:userId', validateIdParam('userId'), asyncHandler(getUserAnalytics));

/**
 * Get performance metrics
 * GET /api/analytics/performance
 */
analyticsRouter.get('/performance', asyncHandler(getPerformanceMetrics));

/**
 * Export analytics data
 * GET /api/analytics/export
 * Query params: format (json|csv), startDate, endDate
 */
analyticsRouter.get('/export', asyncHandler(exportAnalyticsData));

export default analyticsRouter;