import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import passport from './configs/passport.js'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import packRouter from './routes/packRoutes.js';
import videoRouter from './routes/videoRoutes.js';
import supportRouter from './routes/supportRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import authRouter from './routes/authRoutes.js';

import withoutAuthRouter from './routes/without-authRouter.js';
import cleanupOldSessions from './configs/cron.js';

import translationRouter from './routes/translationRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import analyticsRouter from './routes/analyticsRoutes.js';
import { auth, attachPlanInfo } from './middlewares/auth.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { generalRateLimiter, authRateLimiter } from './middlewares/rateLimiter.js';
import https from 'https';
import fs from 'fs'

const app = express()

await connectCloudinary()
cleanupOldSessions()

const httpsOptions = {
  key: fs.readFileSync('../crts/localhost-key.pem'),
  cert: fs.readFileSync('../crts/localhost.pem'),
};

// Security middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}))

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
app.use('/api/', generalRateLimiter)

// Passport initialization
app.use(passport.initialize())

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/', (req, res)=> res.send('Server is Live!'))
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Public auth routes with stricter rate limiting
app.use('/api/auth', authRateLimiter, authRouter)
app.use('/api/without-auth', withoutAuthRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/translate', translationRouter)
app.use('/api/admin', adminRouter)
app.use('/api/support', supportRouter)

// Protected routes
//app.use(auth)
//app.use(attachPlanInfo)

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
app.use('/api/packs', packRouter)
app.use('/api/videos', videoRouter)


// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

const PORT = process.env.PORT || 4000;

// HTTP server
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
})
https.createServer(httpsOptions, app).listen(3443, () => {
  console.log('HTTPS running on https://localhost:3443');
});