import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  generateVideoScript,
  generateVideoFromAssets,
  shareVideoToSocial,
  getUserVideoStats,
  getUserVideos,
  deleteVideo
} from '../controllers/videoController.js';

const videoRouter = express.Router();

videoRouter.post('/generate-script', auth, generateVideoScript);
videoRouter.post('/generate-from-assets', auth, generateVideoFromAssets);
videoRouter.post('/share-to-social', auth, shareVideoToSocial);
videoRouter.get('/get-videos', auth, getUserVideos);
videoRouter.get('/get-stats', auth, getUserVideoStats);
videoRouter.delete('/delete-video/:videoId', auth, deleteVideo);

export default videoRouter;
