import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import aiReducer from './slices/aiSlice'
import videoReducer from './slices/videoSlice'
import packReducer from './slices/packSlice'
import adminReducer from './slices/adminSlice'
import socialReducer from './slices/socialSlice'
import supportReducer from './slices/supportSlice'
import articleReducer from './slices/articleSlice'
import imageHistoryReducer from './slices/imageHistorySlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ai: aiReducer,
    video: videoReducer,
    pack: packReducer,
    admin: adminReducer,
    social: socialReducer,
    support: supportReducer,
    article: articleReducer,
    imageHistory: imageHistoryReducer,

    
  },
  devTools: {
    trace: true,
    traceLimit: 25,
  },
})

export default store
