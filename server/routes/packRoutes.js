import express from 'express';
import { auth } from '../middlewares/auth.js';
import {
  getAllPacks,
  getPackById,
  createPack,
  updatePack,
  deletePack,
  subscribeToPack
} from '../controllers/packController.js';

const packRouter = express.Router();

packRouter.get('/get-all-packs', auth, getAllPacks);
packRouter.get('/get-pack/:id', auth, getPackById);
packRouter.post('/create-pack', auth, createPack);
packRouter.put('/update-pack/:id', auth, updatePack);
packRouter.delete('/delete-pack/:id', auth, deletePack);
packRouter.post('/subscribe', auth, subscribeToPack);

export default packRouter;
