import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const createComplaint = createAsyncThunk(
  'support/createComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/support/create-complaint`, complaintData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create complaint')
    }
  }
)

export const fetchMyComplaints = createAsyncThunk(
  'support/fetchMyComplaints',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/support/get-my-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints')
    }
  }
)

const supportSlice = createSlice({
  name: 'support',
  initialState: {
    complaints: [],
    isLoading: false,
    error: null,
    success: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    resetForm: (state) => {
      state.success = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComplaint.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.complaints.unshift(action.payload.complaint) // Add new complaint to the list
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(fetchMyComplaints.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyComplaints.fulfilled, (state, action) => {
        state.isLoading = false
        state.complaints = action.payload.complaints
      })
      .addCase(fetchMyComplaints.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSuccess, resetForm } = supportSlice.actions
export default supportSlice.reducer