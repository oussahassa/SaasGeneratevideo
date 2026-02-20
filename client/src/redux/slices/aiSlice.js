import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const generateBlogTitles = createAsyncThunk(
  'ai/generateBlogTitles',
  async (topic, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/ai/blog-titles`, { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate titles')
    }
  }
)

export const writeArticle = createAsyncThunk(
  'ai/writeArticle',
  async (payload, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/ai/write-article`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to write article')
    }
  }
)

export const generateImages = createAsyncThunk(
  'ai/generateImages',
  async ({ prompt, publish }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/ai/generate-image`, { prompt, publish }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate images')
    }
  }
)

export const removeBackground = createAsyncThunk(
  'ai/removeBackground',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/ai/remove-image-background`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove background')
    }
  }
)

export const removeObject = createAsyncThunk(
  'ai/removeObject',
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/ai/remove-object`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove object')
    }
  }
)

const initialState = {
  data: null,
  isLoading: false,
  error: null,
  success: false,
}

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    resetState: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate Blog Titles
      .addCase(generateBlogTitles.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(generateBlogTitles.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.success = true
      })
      .addCase(generateBlogTitles.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Write Article
      .addCase(writeArticle.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(writeArticle.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.success = true
      })
      .addCase(writeArticle.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Generate Images
      .addCase(generateImages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(generateImages.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.success = true
      })
      .addCase(generateImages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Remove Background
      .addCase(removeBackground.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeBackground.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.success = true
      })
      .addCase(removeBackground.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Remove Object
      .addCase(removeObject.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeObject.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
        state.success = true
      })
      .addCase(removeObject.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { resetState } = aiSlice.actions

export default aiSlice.reducer
