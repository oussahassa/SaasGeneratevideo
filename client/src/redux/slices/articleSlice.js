import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

export const fetchMyArticles = createAsyncThunk(
  'article/fetchMyArticles',
  async ({ page = 1, lim = 10, filter = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.USER.GET_CREATIONS + `?page=${page}&lim=${lim}&filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch articles');
    }
  }
);

const articleSlice = createSlice({
  name: 'article',
  initialState: {
    articles: [],
    total: 0,
    page: 1,
    lim: 10,
    filter: '',
    loading: false,
    error: null,
  },
  reducers: {
    setPage(state, action) {
      state.page = action.payload;
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchMyArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, setFilter } = articleSlice.actions;
export default articleSlice.reducer;
