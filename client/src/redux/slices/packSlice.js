import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const fetchPacks = createAsyncThunk(
  'pack/fetchPacks',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/packs/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch packs')
    }
  }
)

export const purchasePack = createAsyncThunk(
  'pack/purchasePack',
  async (packId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/packs/purchase`, { packId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to purchase pack')
    }
  }
)

const initialState = {
  packs: [],
  isLoading: false,
  error: null,
  success: false,
}

const packSlice = createSlice({
  name: 'pack',
  initialState,
  extraReducers: (builder) => {
    builder
      // Fetch Packs
      .addCase(fetchPacks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPacks.fulfilled, (state, action) => {
        state.isLoading = false
        state.packs = action.payload
      })
      .addCase(fetchPacks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Purchase Pack
      .addCase(purchasePack.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(purchasePack.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
      })
      .addCase(purchasePack.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export default packSlice.reducer
