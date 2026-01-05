import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';


export const FetchSubmissions = createAsyncThunk(
    'submission/fetchSubmissions',
    async (moduleId, { rejectWithValue }) => {
      try {
        const response = await api.get(`/api/globalAdmin/getSubmissions/${moduleId}`);
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );

export const gradeSubmission = createAsyncThunk(
  'submission/gradeSubmission',
  async (payload, { rejectWithValue }) => {  // Changed parameter to payload
    try {
      console.log('Sending grade data:', payload); // Debug log
      const response = await api.post('/api/globalAdmin/gradeSubmission', payload);
      console.log('Grade submission response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error in admingradeSubmission:', error); // Debug log
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
const adminSubmissionSlice = createSlice({
  name: 'submission',
  initialState: {
    items: [],
    uploading: false,
    aiProcessing:false,
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
      .addCase(FetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(FetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(FetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch submissions';
      })
      .addCase(gradeSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.items.find((item) => item._id === action.payload._id).grade = action.payload.grade;
        state.items.find((item) => item._id === action.payload._id).feedback = action.payload.feedback;
        
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to grade submission';
      })
      
      
      
  }
});

export const { setFilters, clearFilters } = adminSubmissionSlice.actions;
export default adminSubmissionSlice.reducer;