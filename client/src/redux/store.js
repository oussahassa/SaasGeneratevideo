import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import aiReducer from './slices/aiSlice'
import videoReducer from './slices/videoSlice'
import packReducer from './slices/packSlice'
import adminReducer from './slices/adminSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ai: aiReducer,
    video: videoReducer,
    pack: packReducer,
    admin: adminReducer,
  },
  devTools: {
    trace: true,
    traceLimit: 25,
  },
})

export default store
