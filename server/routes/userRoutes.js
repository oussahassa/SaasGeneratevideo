import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getUserProfile, getUserPlan, getPublishedCreations, getUserCreations, toggleLikeCreation, updateUserProfile, getDashboardStats, getSessions, revokeSession } from '../controllers/userController.js';

const userRouter = express.Router()

userRouter.get('/profile', auth, getUserProfile)
userRouter.get('/plan', auth, getUserPlan)
userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations)
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation)
userRouter.put('/update-profile', auth, updateUserProfile)
userRouter.get('/dashboard-stats', auth, getDashboardStats)
userRouter.get('/sessions', auth, getSessions)
userRouter.post('/revoke-session', auth, revokeSession)

export default userRouter;