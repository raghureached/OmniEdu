import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiOld';

// Async thunks for assignment management
export const fetchAssignments = createAsyncThunk(
  'assignments/fetchAssignments',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/assignments', { params: filters });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/updateAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/assignments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/assignments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Assignment slice
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    items: [],
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
      // Fetch assignments
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload;
        state.totalCount = action.payload.totalCount || action.payload.length;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch assignments';
      })
      
      // Create assignment
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update assignment
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete assignment
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { setFilters, clearFilters } = assignmentSlice.actions;
export default assignmentSlice.reducer;