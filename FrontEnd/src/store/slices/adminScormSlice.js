import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch admin (org-scoped) SCORM modules
export const fetchAdminScorms = createAsyncThunk(
  'adminScorm/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/scorm/fetch');
      return res.data?.modules || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch SCORM modules' });
    }
  }
);

const adminScormSlice = createSlice({
  name: 'adminScorm',
  initialState: {
    scorms: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminScormError(state) {
      state.error = null;
    },
    setAdminScorms(state, action) {
      state.scorms = Array.isArray(action.payload) ? action.payload : [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminScorms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminScorms.fulfilled, (state, action) => {
        state.loading = false;
        state.scorms = action.payload;
      })
      .addCase(fetchAdminScorms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch SCORM modules';
      });
  },
});

export const { clearAdminScormError, setAdminScorms } = adminScormSlice.actions;

export default adminScormSlice.reducer;

// Selectors
export const selectAdminScorms = (state) => state.adminScorm?.scorms || [];
export const selectAdminScormLoading = (state) => state.adminScorm?.loading || false;
export const selectAdminScormError = (state) => state.adminScorm?.error || null;


