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

export const fetchClientPacks = createAsyncThunk(
  'pack/fetchClientPacks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.PACKS.GET_CLIENT_PACKS)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans')
    }
  }
)

export const upgradePlan = createAsyncThunk(
  'pack/upgradePlan',
  async (packId, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.USER.UPGRADE_PLAN, { packId })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upgrade plan')
    }
  }
)

export const initiatePayment = createAsyncThunk(
  'pack/initiatePayment',
  async ({ method, packId, amount, currency }, { rejectWithValue }) => {
    try {
      const endpoint = 
        method === 'stripe' ? API_ENDPOINTS.PAYMENTS.STRIPE_CREATE :
        method === 'paypal' ? API_ENDPOINTS.PAYMENTS.PAYPAL_CREATE :
        API_ENDPOINTS.PAYMENTS.PAYMEE_CREATE
      
      const response = await api.post(endpoint, {
        packId,
        amount,
        currency
      })
      return { ...response.data, method }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment initialization failed')
    }
  }
)

const initialState = {
  packs: [],
  isLoading: false,
  paymentLoading: false,
  error: null,
  success: false,
  paymentUrl: null,
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
        state.packs = action?.payload?.packs || []
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
      // Fetch Client Packs
      .addCase(fetchClientPacks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClientPacks.fulfilled, (state, action) => {
        state.isLoading = false
        state.packs = action?.payload?.packs || []
      })
      .addCase(fetchClientPacks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Upgrade Plan
      .addCase(upgradePlan.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(upgradePlan.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
      })
      .addCase(upgradePlan.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.paymentLoading = true
        state.error = null
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.paymentLoading = false
        state.paymentUrl = action.payload
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.paymentLoading = false
        state.error = action.payload
      })
  }
})

export default packSlice.reducer
