import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchActivityLogs = createAsyncThunk(
  'activityLog/fetchActivityLogs',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/activity-logs', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState: {
    logs: [],
    loading: false,
    error: null,
    filters: {
      dateRange: 'thisMonth',
      criteria: 'all'
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload.logs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, setPage } = activityLogSlice.actions;
export default activityLogSlice.reducer;