import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for assignment management
export const adminfetchAssignments = createAsyncThunk(
  'adminAssignments/fetchAssignments',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/getAssignments', { params: filters });
      return response.data; // { isSuccess, message, data: [...] }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const admincreateAssignment = createAsyncThunk(
  'adminAssignments/createAssignment',
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
  'adminAssignments/updateAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/editAssignment/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const admindeleteAssignment = createAsyncThunk(
  'adminAssignments/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteAssignment/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const admingetAssignment = createAsyncThunk(
  'adminAssignments/getAssignment',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/getAssignment/${id}`);
      return res.data; // { isSuccess, data }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch assignment' });
    }
  }
);

// Assignment slice
const adminAssignmentSlice = createSlice({
  name: 'adminAssignments',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {},
    totalCount: 0,
    selected: null,
    selectedLoading: false,
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
        const arr = action.payload?.data || [];
        state.items = Array.isArray(arr) ? arr : [];
        state.totalCount = state.items.length;
      })
      .addCase(adminfetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch assignments';
      })
      
      // Create assignment
      .addCase(admincreateAssignment.fulfilled, (state, action) => {
        const created = action.payload?.data || action.payload;
        if (created) state.items.push(created);
      })
      
      // Update assignment
      .addCase(adminupdateAssignment.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        const updatedId = updated?.uuid || updated?._id || updated?.id;
        const index = state.items.findIndex(item => (item?.uuid || item?._id || item?.id) === updatedId);
        if (index !== -1) {
          state.items[index] = updated;
        }
      })
      
      // Delete assignment
      .addCase(admindeleteAssignment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.items = state.items.map((item) => {
          const id = item?.uuid || item?._id || item?.id;
          if (id === deletedId) {
            return { ...item, status: 'Removed' };
          }
          return item;
        });
      })
      // Get single assignment
      .addCase(admingetAssignment.pending, (state) => {
        state.selectedLoading = true;
        state.selected = null;
      })
      .addCase(admingetAssignment.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload?.data || null;
      })
      .addCase(admingetAssignment.rejected, (state, action) => {
        state.selectedLoading = false;
        state.error = action.payload?.message || 'Failed to fetch assignment';
      });
  }
});

export const { setFilters, clearFilters } = adminAssignmentSlice.actions;
export default adminAssignmentSlice.reducer;