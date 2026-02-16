import express from 'express'
import { signup, login, logout, verifyToken, verifyEmail, resendVerificationCode, forgotPassword, resetPassword, refreshAccessToken } from '../controllers/authController.js'
import { auth } from '../middlewares/auth.js'

const authRouter = express.Router()

// Auth endpoints
authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/verify-email', verifyEmail)
authRouter.post('/resend-verification', resendVerificationCode)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password', resetPassword)
authRouter.get('/verify', auth, verifyToken)
authRouter.post('/refresh', refreshAccessToken)

export default authRouter
