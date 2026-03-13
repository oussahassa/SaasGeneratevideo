import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import { API_ENDPOINTS } from '../../config/api';
export const fetchImageHistory = createAsyncThunk(
  'imageHistory/fetchImageHistory',
  async ({ page = 1, lim = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.USER.IMAGE_HISTORY(page, lim), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch image history');
    }
  }
);
export const fetchCreations  = createAsyncThunk(
  'imageHistory/get-published-creations',
  async ( { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.USER.PUBLISH_CREATION, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
            state.creations = action.payload;            })
            .addCase(fetchCreations.rejected, (state, action) => {
              state.isLoading = false
              state.error = action.payload
            })
  },
});

export const { setPage } = imageHistorySlice.actions;
export default imageHistorySlice.reducer;
