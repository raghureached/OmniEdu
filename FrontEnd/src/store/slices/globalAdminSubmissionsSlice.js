import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';


export const fetchSubmissions = createAsyncThunk(
    'submission/fetchSubmissions',
    async (filters, { rejectWithValue }) => {
      try {
        const response = await api.get('/api/globalAdmin/getSubmissions', { params: filters });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );

export const gradeSubmission = createAsyncThunk(
    'submission/gradeSubmission',
    async (submissionId, grade, feedback, { rejectWithValue }) => {
      try {
        const response = await api.post('/api/globalAdmin/gradeSubmission', { submissionId, grade, feedback });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  ); 
const globalSubmissionSlice = createSlice({
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
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
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

export const { setFilters, clearFilters } = globalSubmissionSlice.actions;
export default globalSubmissionSlice.reducer;