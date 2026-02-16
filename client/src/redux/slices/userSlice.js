import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchUserData = createAsyncThunk('user/fetchUserData', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user data')
  }
})

export const fetchUserPlan = createAsyncThunk('user/fetchUserPlan', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/user/plan`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user plan')
  }
})

export const upgradePlan = createAsyncThunk('user/upgradePlan', async (planType, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(`${API_URL}/user/upgrade-plan`, { planType }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upgrade plan')
  }
})

const initialState = {
  userData: null,
  plan: {
    type: 'free',
    exists: false,
    credits: 0,
  },
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  extraReducers: (builder) => {
    builder
      // Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false
        state.userData = action.payload
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch User Plan
      .addCase(fetchUserPlan.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserPlan.fulfilled, (state, action) => {
        state.isLoading = false
        state.plan = {
          type: action.payload.planType || 'free',
          exists: !!action.payload.planType,
          credits: action.payload.credits || 0,
        }
      })
      .addCase(fetchUserPlan.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Upgrade Plan
      .addCase(upgradePlan.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(upgradePlan.fulfilled, (state, action) => {
        state.isLoading = false
        state.plan = {
          type: action.payload.planType,
          exists: true,
          credits: action.payload.credits || 0,
        }
      })
      .addCase(upgradePlan.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default userSlice.reducer
