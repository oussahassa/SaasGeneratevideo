import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

import { API_ENDPOINTS } from '../../config/api';

export const fetchAdminData = createAsyncThunk(
  'admin/fetchAdminData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_DASHBOARD_STATS, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin data')
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(API_ENDPOINTS.ADMIN.GET_ALL_USERS, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId), {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
    }
  }
)

const initialState = {
  data: null,
  users: [],
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
        state.users = action.payload
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
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default adminSlice.reducer
