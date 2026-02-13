import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintsStats
} from '../controllers/supportController.js';

const supportRouter = express.Router();

// FAQ routes
supportRouter.get('/get-faqs', auth, getAllFAQs);
supportRouter.post('/create-faq', auth, createFAQ);
supportRouter.put('/update-faq/:id', auth, updateFAQ);
supportRouter.delete('/delete-faq/:id', auth, deleteFAQ);

// Complaint routes
supportRouter.post('/create-complaint', auth, createComplaint);
supportRouter.get('/get-my-complaints', auth, getUserComplaints);
supportRouter.get('/get-all-complaints', auth, getAllComplaints);
supportRouter.put('/update-complaint/:id', auth, updateComplaintStatus);
supportRouter.delete('/delete-complaint/:id', auth, deleteComplaint);
supportRouter.get('/complaints-stats', auth, getComplaintsStats);

export default supportRouter;
