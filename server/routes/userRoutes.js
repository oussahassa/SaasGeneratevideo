import express from 'express';
import { auth } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';
import { getImageHistory,getUserProfile, getUserPlan, getPublishedCreations, getUserCreations, toggleLikeCreation, updateUserProfile, getDashboardStats, getSessions, revokeSession, upgradePlan } from '../controllers/userController.js';

const userRouter = express.Router()

userRouter.get('/profile', auth, getUserProfile)
userRouter.get('/plan', auth, getUserPlan)
userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations)
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation)
userRouter.put('/update-profile', auth, upload.single('profileImage'), updateUserProfile)
userRouter.get('/dashboard-stats', auth, getDashboardStats)
userRouter.get('/sessions', auth, getSessions)
userRouter.post('/revoke-session', auth, revokeSession)
userRouter.post('/upgrade-plan', auth, upgradePlan)
userRouter.get('/image-history', auth, getImageHistory)

export default userRouter;