import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

import {baseURL} from '../../utils/api'
const API_URL = baseURL
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    localStorage.setItem('token', response.data.token)
    if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const signupUser = createAsyncThunk('auth/signupUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, credentials)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Signup failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await axios.post(`${API_URL}/auth/logout`)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    return null
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed')
  }
})

export const verifyToken = createAsyncThunk('auth/verifyToken', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return null
    }
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return rejectWithValue(error.response?.data?.message || 'Verification failed')
  }
})

export const fetchUserPlan = createAsyncThunk('auth/fetchUserPlan', async (_, { rejectWithValue }) => {
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

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),
  plan: null,
  credits: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      localStorage.setItem('user', JSON.stringify(action.payload))
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Verify Token
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.user = action.payload.user
          state.isAuthenticated = true
        }
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      // Fetch User Plan
      .addCase(fetchUserPlan.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchUserPlan.fulfilled, (state, action) => {
        state.isLoading = false
        state.plan = action.payload.planType
        state.credits = action.payload.credits
      })
      .addCase(fetchUserPlan.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default authSlice.reducer
export const { setUser } = authSlice.actions
