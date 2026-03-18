import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

import { API_ENDPOINTS } from '../../config/api';
export const fetchImageHistory = createAsyncThunk(
  'imageHistory/fetchImageHistory',
  async ({ page = 1, lim = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.USER.IMAGE_HISTORY(page, lim));
      console.log('Fetched image history:', response.data); // Debug log
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch image history');
    }
  }
);
export const fetchCreations  = createAsyncThunk(
  'imageHistory/get-published-creations',
  async ({ type, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (type && type !== 'all') params.append('type', type);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_ENDPOINTS.USER.PUBLISH_CREATION}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await api.get(url);
      console.log('get-published-creations:', response.data); // Debug log

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch image history');
    }
  }
);
const initialState = {
  images: [],
  creations:[],
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  error: null,
};

const imageHistorySlice = createSlice({
  name: 'imageHistory',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchImageHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImageHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images = action.payload.images;
        state.total = action.payload.total;
      })
      .addCase(fetchImageHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

        // get image
            .addCase(fetchCreations.pending, (state) => {
              state.isLoading = true
              state.error = null
            })
            .addCase(fetchCreations.fulfilled, (state, action) => {
              state.isLoading = false
            state.creations = action.payload.creations;            })
            .addCase(fetchCreations.rejected, (state, action) => {
              state.isLoading = false
              state.error = action.payload
            })
  },
});

export const { setPage } = imageHistorySlice.actions;
export default imageHistorySlice.reducer;
