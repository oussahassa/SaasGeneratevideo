import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

import { API_ENDPOINTS } from '../../config/api';

export const fetchAdminData = createAsyncThunk(
  'admin/fetchAdminData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.GET_DASHBOARD_STATS)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin data')
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
    try {
      let url = `${API_ENDPOINTS.ADMIN.GET_ALL_USERS}?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await api.get(url)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ userId, isBlocked }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.ADMIN.TOGGLE_USER_STATUS(userId), { isBlocked })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle user status')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId))
      return { ...response.data, userId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

const initialState = {
  data: null,
  users: [],
  pagination: { page: 1, limit: 10, pages: 1, total: 0 },
  isLoading: false,
  error: null,
  success: false,
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  extraReducers: (builder) => {
    builder
      // Fetch Admin Data
      .addCase(fetchAdminData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.users || []
        state.pagination = action.payload.pagination || state.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.users = state.users.filter(user => user.id !== action.payload.userId)
      })
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        if (action.payload.user) {
          state.users = state.users.map((user) =>
            user.id === action.payload.user.id ? action.payload.user : user
          )
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.users = state.users.filter(user => user.id !== action.payload.userId)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default adminSlice.reducer
