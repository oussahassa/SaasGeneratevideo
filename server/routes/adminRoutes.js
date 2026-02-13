import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  getDailyStats,
  getFeatureUsageStats
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/dashboard-stats', auth, getDashboardStats);
adminRouter.get('/get-all-users', auth, getAllUsers);
adminRouter.get('/get-user/:id', auth, getUserDetails);
adminRouter.put('/toggle-user-status/:id', auth, toggleUserStatus);
adminRouter.delete('/delete-user/:id', auth, deleteUser);
adminRouter.get('/daily-stats', auth, getDailyStats);
adminRouter.get('/feature-usage-stats', auth, getFeatureUsageStats);

export default adminRouter;
