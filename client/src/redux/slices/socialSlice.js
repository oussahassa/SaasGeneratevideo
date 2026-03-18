import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { API_ENDPOINTS } from '../../config/api';

export const fetchSocialAccounts = createAsyncThunk(
  'social/fetchSocialAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.SOCIAL_ACCOUNTS)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch social accounts')
    }
  }
)

export const initiateSocialLogin = createAsyncThunk(
  'social/initiateSocialLogin',
  async ({ platform, redirectUrl }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.SOCIAL_LOGIN(platform, redirectUrl))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate social login')
    }
  }
)

export const disconnectSocialAccount = createAsyncThunk(
  'social/disconnectSocialAccount',
  async (platform, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_ENDPOINTS.AUTH.DISCONNECT_SOCIAL(platform))
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to disconnect social account')
    }
  }
)

const socialSlice = createSlice({
  name: 'social',
  initialState: {
    accounts: [],
    isLoading: false,
    error: null,
    success: false
  },
  reducers: {
    clearSocialState: (state) => {
      state.error = null
      state.success = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Social Accounts
      .addCase(fetchSocialAccounts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSocialAccounts.fulfilled, (state, action) => {
        state.isLoading = false
        state.accounts = action.payload.accounts || []
        state.success = true
      })
      .addCase(fetchSocialAccounts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Initiate Social Login
      .addCase(initiateSocialLogin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initiateSocialLogin.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        // Redirect to auth URL
        if (action.payload.authUrl) {
          window.location.href = action.payload.authUrl
        }
      })
      .addCase(initiateSocialLogin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Disconnect Social Account
      .addCase(disconnectSocialAccount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(disconnectSocialAccount.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        // Remove the disconnected account from state
        state.accounts = state.accounts.filter(account => account.platform !== action.meta.arg)
      })
      .addCase(disconnectSocialAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearSocialState } = socialSlice.actions
export default socialSlice.reducer