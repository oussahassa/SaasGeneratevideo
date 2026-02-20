import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const generateVideo = createAsyncThunk(
  'video/generateVideo',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/videos/generate-script`, payload, {
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
      const response = await axios.get(`${API_URL}/videos/get-videos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos')
    }
  }
)

export const fetchVideoStats = createAsyncThunk(
  'video/fetchVideoStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/videos/get-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const deleteVideo = createAsyncThunk(
  'video/deleteVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`${API_URL}/videos/delete-video/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return { videoId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete video')
    }
  }
)

export const shareVideo = createAsyncThunk(
  'video/shareVideo',
  async ({ videoId, platform, caption }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/videos/share-to-social`, { videoId, platform, caption }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share video')
    }
  }
)

const initialState = {
  videos: [],
  stats: null,
  isLoading: false,
  error: null,
  success: false,
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    resetVideoState: (state) => {
      state.videos = [];
      state.stats = null;
      state.isLoading = false;
      state.error = null;
      state.success = false;
    },
  },
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
        state.videos = action.payload.videos || []
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Stats
      .addCase(fetchVideoStats.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVideoStats.fulfilled, (state, action) => {
        state.isLoading = false
        state.stats = action.payload.stats
      })
      .addCase(fetchVideoStats.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete Video
      .addCase(deleteVideo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.isLoading = false
        state.videos = state.videos.filter(video => video.id !== action.payload.videoId)
        state.success = true
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Share Video
      .addCase(shareVideo.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(shareVideo.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
      })
      .addCase(shareVideo.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { resetVideoState } = videoSlice.actions

export default videoSlice.reducer
