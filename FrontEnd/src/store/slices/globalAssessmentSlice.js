import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGlobalAssessments = createAsyncThunk(
  'globalAssessments/fetchGlobalAssessments',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/globalAdmin/getAssessments', { params: filters });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const globalAssessmentSlice = createSlice({
  name: 'globalAssessments',
  initialState: {
    assessments: [],
    loading: false,
    error: null,
    filters: {},
    totalCount: 0
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalAssessments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalAssessments.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.assessments = action.payload;
      })
      .addCase(fetchGlobalAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters } = globalAssessmentSlice.actions;

export default globalAssessmentSlice.reducer;
