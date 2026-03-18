import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

import { API_ENDPOINTS } from '../../config/api';
export const fetchPacks = createAsyncThunk(
  'pack/fetchPacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.PACKS.GET_ALL)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch packs')
    }
  }
)

export const createPack = createAsyncThunk(
  'pack/createPack',
  async (packData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.PACKS.CREATE, packData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create pack')
    }
  }
)

export const updatePack = createAsyncThunk(
  'pack/updatePack',
  async ({ id, packData }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.PACKS.UPDATE(id), packData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update pack')
    }
  }
)

export const deletePack = createAsyncThunk(
  'pack/deletePack',
  async (packId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_ENDPOINTS.PACKS.DELETE(packId))
      return { ...response.data, packId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete pack')
    }
  }
)

export const purchasePack = createAsyncThunk(
  'pack/purchasePack',
  async (packId, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.PACKS.PURCHASE, { packId })
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
      .addCase(createPack.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPack.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.packs.push(action.payload.pack || action.payload)
      })
      .addCase(createPack.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updatePack.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePack.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        if (action.payload.pack) {
          state.packs = state.packs.map((pack) => (pack.id === action.payload.pack.id ? action.payload.pack : pack))
        }
      })
      .addCase(updatePack.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(deletePack.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePack.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.packs = state.packs.filter(pack => pack.id !== action.payload.packId)
      })
      .addCase(deletePack.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
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
