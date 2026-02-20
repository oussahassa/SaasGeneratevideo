import express from 'express'
import { translateAndSave, getTranslations } from '../controllers/translationController.js'
import rateLimit from '../middlewares/rateLimit.js'

const router = express.Router()

// Limit and translate
router.post('/translate-and-save', rateLimit({ windowMs: 60*1000, max: 30 }), translateAndSave)
router.get('/get', getTranslations)

export default router