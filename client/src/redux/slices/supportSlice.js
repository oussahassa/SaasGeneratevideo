import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

import { API_ENDPOINTS } from '../../config/api';

export const createComplaint = createAsyncThunk(
  'support/createComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.SUPPORT.CREATE_COMPLAINT, complaintData)
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
      const response = await api.get(API_ENDPOINTS.SUPPORT.GET_MY_COMPLAINTS)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints')
    }
  }
)

export const fetchFaqs = createAsyncThunk(
  'support/fetchFaqs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.SUPPORT.GET_FAQS)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch faqs')
    }
  }
)

export const createFaq = createAsyncThunk(
  'support/createFaq',
  async (faqData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.SUPPORT.CREATE_FAQ, faqData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create faq')
    }
  }
)

export const updateFaq = createAsyncThunk(
  'support/updateFaq',
  async ({ id, faqData }, { rejectWithValue }) => {
    try {
      const response = await api.put(API_ENDPOINTS.SUPPORT.UPDATE_FAQ(id), faqData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update faq')
    }
  }
)

export const deleteFaq = createAsyncThunk(
  'support/deleteFaq',
  async (faqId, { rejectWithValue }) => {
    try {
      const response = await api.delete(API_ENDPOINTS.SUPPORT.DELETE_FAQ(faqId))
      return { ...response.data, faqId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete faq')
    }
  }
)

const supportSlice = createSlice({
  name: 'support',
  initialState: {
    complaints: [],
    faqs: [],
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
      .addCase(fetchFaqs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.isLoading = false
        state.faqs = action.payload.faqs || []
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createFaq.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.faqs.unshift(action.payload.faq || action.payload)
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateFaq.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.success = false
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        if (action.payload.faq) {
          state.faqs = state.faqs.map((faq) => (faq.id === action.payload.faq.id ? action.payload.faq : faq))
        }
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(deleteFaq.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.isLoading = false
        state.success = true
        state.faqs = state.faqs.filter((faq) => faq.id !== action.payload.faqId)
      })
      .addCase(deleteFaq.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearSuccess, resetForm } = supportSlice.actions
export default supportSlice.reducer