import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiOld';

// Async thunks for assignment management
export const adminfetchAssignments = createAsyncThunk(
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

export const admincreateAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
    console.log(assignmentData)
      const response = await api.post('api/admin/createAssignment', assignmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const adminupdateAssignment = createAsyncThunk(
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

export const admindeleteAssignment = createAsyncThunk(
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
const adminAssignmentSlice = createSlice({
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
      .addCase(adminfetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminfetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload;
        state.totalCount = action.payload.totalCount || action.payload.length;
      })
      .addCase(adminfetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch assignments';
      })
      
      // Create assignment
      .addCase(admincreateAssignment.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update assignment
      .addCase(adminupdateAssignment.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete assignment
      .addCase(admindeleteAssignment.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { setFilters, clearFilters } = adminAssignmentSlice.actions;
export default adminAssignmentSlice.reducer;