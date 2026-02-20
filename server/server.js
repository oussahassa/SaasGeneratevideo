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

import translationRouter from './routes/translationRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import { auth, attachPlanInfo } from './middlewares/auth.js';

const app = express()

await connectCloudinary()

app.use(cors({
  origin: "*",
  credentials: true
}))
app.use(express.json())
app.use(passport.initialize())

app.get('/', (req, res)=>res.send('Server is Live!'))

// Public auth routes
app.use('/api/auth', authRouter)
app.use('/api/without-auth', withoutAuthRouter)

// Protected routes
app.use(auth)
app.use(attachPlanInfo)

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
app.use('/api/packs', packRouter)
app.use('/api/videos', videoRouter)
app.use('/api/support', supportRouter)
app.use('/api/admin', adminRouter)

app.use('/api/payments', paymentRouter)
app.use('/api/translate', translationRouter)

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=> {
    console.log('Server is running on port', PORT);
})
