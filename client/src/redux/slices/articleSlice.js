import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { API_ENDPOINTS } from '../../config/api';

export const fetchMyArticles = createAsyncThunk(
  'article/fetchMyArticles',
  async ({ page = 1, lim = 10, filter = '' }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.USER.GET_CREATIONS + `?page=${page}&lim=${lim}&filter=${filter}`);
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
        state.articles = action.payload.creations || [];
        state.total = action.payload.creations.length || 0;
      })
      .addCase(fetchMyArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, setFilter } = articleSlice.actions;
export default articleSlice.reducer;
