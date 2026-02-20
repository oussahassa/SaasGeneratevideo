import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getAllFAQs,

} from '../controllers/supportController.js';
import {
  getAllPacks,

} from '../controllers/packController.js';
const withoutAuthRouter = express.Router();


withoutAuthRouter.get('/get-faqs-clients', getAllFAQs);
withoutAuthRouter.get('/get-packs-clients', getAllPacks);
export default withoutAuthRouter