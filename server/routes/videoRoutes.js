import express from 'express';
import { auth } from '../middlewares/auth.js';
import { validateVideoParams, validateShareParams, validateIdParam } from '../middlewares/validation.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import {
  generateVideo,
  generateVideoFromAssets,
  shareVideoToSocial,
  getUserVideoStats,
  getUserVideos,
  deleteVideo
} from '../controllers/videoController.js';

const videoRouter = express.Router();

// All video routes require authentication
videoRouter.use(auth);

// Generate video with validation
videoRouter.post('/generate-video', validateVideoParams, asyncHandler(generateVideo));

// Generate video from assets with validation
videoRouter.post('/generate-from-assets', asyncHandler(generateVideoFromAssets));

// Share video to social platforms with validation
videoRouter.post('/share-to-social', validateShareParams, asyncHandler(shareVideoToSocial));

// Get user videos
videoRouter.get('/get-videos', asyncHandler(getUserVideos));

// Get video statistics
videoRouter.get('/get-stats', asyncHandler(getUserVideoStats));

// Delete video with ID validation
videoRouter.delete('/delete-video/:videoId', validateIdParam('videoId'), asyncHandler(deleteVideo));

export default videoRouter;
