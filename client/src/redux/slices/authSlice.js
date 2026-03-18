import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import api from '../../utils/api'
import { setAuthToken, setRefreshToken, setAuthUser, getAuthToken, getAuthUser, clearAuthAll } from '../../utils/authCookies'

import { API_ENDPOINTS } from '../../config/api';
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.AUTH.LOGIN}`, credentials)
    console.log('Login response:', response.data) // Debug log
    setAuthToken(response.data.token)
    if (response.data.refreshToken) setRefreshToken(response.data.refreshToken)
    setAuthUser(response.data.user)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Login failed')
  }
})

export const signupUser = createAsyncThunk('auth/signupUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_ENDPOINTS.AUTH.SIGNUP}`, credentials)
    setAuthToken(response.data.token)
    setRefreshToken(response.data.refreshToken)
    setAuthUser(response.data.user)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Signup failed')
  }
})

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await axios.post(`${API_ENDPOINTS.AUTH.LOGOUT}`)
    clearAuthAll()
    return null
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Logout failed')
  }
})

export const verifyToken = createAsyncThunk('auth/verifyToken', async (_, { rejectWithValue }) => {
  try {
    const token = getAuthToken()
    if (!token) {
      return null
    }
    const response = await api.get(`${API_ENDPOINTS.AUTH.VERIFY}`)
    return response.data
  } catch (error) {
    clearAuthAll()
    return rejectWithValue(error.response?.data?.message || 'Verification failed')
  }
})

export const fetchUserPlan = createAsyncThunk('auth/fetchUserPlan', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(`${API_ENDPOINTS.USER.PLAN}`)
    return response.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch user plan')
  }
})

const initialState = {
  user: getAuthUser(),
  token: getAuthToken(),
  isLoading: false,
  error: null,
  isAuthenticated: !!getAuthToken(),
  plan: null,
  credits: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload
      setAuthUser(action.payload)
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
        const user = action.payload.user || {}
        state.user = {
          ...user,
          is_admin: user.is_admin === true,
          role: user.role || (user.is_admin ? 'admin' : 'user')
        }
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
        const user = action.payload.user || {}
        state.user = {
          ...user,
          is_admin: user.is_admin === true,
          role: user.role || (user.is_admin ? 'admin' : 'user')
        }
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
        if (action.payload && action.payload.user) {
          const user = action.payload.user
          state.user = {
            ...user,
            is_admin: user.is_admin === true,
            role: user.role || (user.is_admin ? 'admin' : 'user')
          }
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
