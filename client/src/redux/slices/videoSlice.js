import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const generateVideo = createAsyncThunk(
  'video/generateVideo',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/videos/generate`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate video')
    }
  }
)

export const fetchVideos = createAsyncThunk(
  'video/fetchVideos',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/videos/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos')
    }
  }
)

const initialState = {
  videos: [],
  isLoading: false,
  error: null,
  success: false,
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  extraReducers: (builder) => {
    builder
      // Generate Video
      .addCase(generateVideo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(generateVideo.fulfilled, (state, action) => {
        state.isLoading = false
        state.videos = [action.payload, ...state.videos]
        state.success = true
      })
      .addCase(generateVideo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Videos
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.isLoading = false
        state.videos = action.payload
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default videoSlice.reducer
