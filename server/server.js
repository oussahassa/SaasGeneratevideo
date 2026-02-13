import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import packRouter from './routes/packRoutes.js';
import videoRouter from './routes/videoRoutes.js';
import supportRouter from './routes/supportRoutes.js';
import adminRouter from './routes/adminRoutes.js';

const app = express()

await connectCloudinary()

app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

app.get('/', (req, res)=>res.send('Server is Live!'))

app.use(requireAuth())

app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)
app.use('/api/packs', packRouter)
app.use('/api/videos', videoRouter)
app.use('/api/support', supportRouter)
app.use('/api/admin', adminRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> {
    console.log('Server is running on port', PORT);
})