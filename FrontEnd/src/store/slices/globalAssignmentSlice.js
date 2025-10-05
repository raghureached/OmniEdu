import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for assignment management
export const fetchGlobalAssignments = createAsyncThunk(
  'globalAssignments/fetchGlobalAssignments',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/globalAdmin/fetchAssignments', { params: filters });
      // console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createGlobalAssignment = createAsyncThunk(
  'globalAssignments/createGlobalAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
      console.log(assignmentData)
      const response = await api.post('/api/globalAdmin/createAssignment', assignmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGlobalAssignment = createAsyncThunk(
  'globalAssignments/updateGlobalAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/globalAssignments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGlobalAssignment = createAsyncThunk(
  'globalAssignments/deleteGlobalAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/globalAssignments/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Assignment slice
const globalAssignmentSlice = createSlice({
  name: 'globalAssignments',
  initialState: {
    content: [],
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
      .addCase(fetchGlobalAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.content = action.payload.data;
        console.log(action.payload)
        state.totalCount = action.payload.totalCount || action.payload.length;
      })
      .addCase(fetchGlobalAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch assignments';
      })
      
      // Create assignment
      .addCase(createGlobalAssignment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGlobalAssignment.fulfilled, (state, action) => {
        state.loading = false;
        state.content.push(action.payload);
      })
      .addCase(createGlobalAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create assignment';
      })
      
      // Update assignment
      .addCase(updateGlobalAssignment.fulfilled, (state, action) => {
        const index = state.content.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.content[index] = action.payload;
        }
      })
      
      // Delete assignment
      .addCase(deleteGlobalAssignment.fulfilled, (state, action) => {
        state.content = state.content.filter(item => item.id !== action.payload);
      });
  }
});

export const { setFilters, clearFilters } = globalAssignmentSlice.actions;
export default globalAssignmentSlice.reducer;