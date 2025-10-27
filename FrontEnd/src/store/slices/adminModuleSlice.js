import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for content management
export const adminfetchContent = createAsyncThunk(
  'adminModule/fetchContent',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('api/admin/getModules', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const adminfetchContentById = createAsyncThunk(
  'adminModule/fetchContentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/getModuleById/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const admincreateContent = createAsyncThunk(
  'adminModule/createContent',
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/createModule', moduleData,{headers:{'Content-Type':'multipart/form-data'}});
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const adminupdateContent = createAsyncThunk(
  'adminModule/updateContent',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/editModule/${id}`, updatedData,{headers:{'Content-Type':'multipart/form-data'}});
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const admindeleteContent = createAsyncThunk(
  'adminModule/deleteContent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteModule/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const adminbulkDeleteContent = createAsyncThunk(
  'adminModule/bulkDeleteContent',
  async (ids, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/admin/bulkDeleteModule`, { data: ids });  
      return ids;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const adminenhanceText = createAsyncThunk(
    'adminModule/enhanceText',
    async ({title,description}, { rejectWithValue }) => {
      try {
        const response = await api.post('/api/admin/enhanceText', {title,description});
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );

const adminModuleSlice = createSlice({
  name: 'adminModule',
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
      .addCase(adminfetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminfetchContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(adminfetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch content';
      })
      .addCase(adminfetchContentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminfetchContentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedContent = action.payload;
      })
      .addCase(adminfetchContentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch content by id';
      })
      .addCase(admincreateContent.pending, (state) => {
        state.loading = true;
        state.uploading = true;
      })
      .addCase(admincreateContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.uploading = false;
      })
      .addCase(admincreateContent.rejected, (state, action) => {
        state.loading = false;
        state.uploading = false;
        state.error = action.payload?.message || 'Failed to create content';
      })
      .addCase(adminupdateContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminupdateContent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.uuid === action.payload.uuid);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(adminupdateContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update content';
      })
      .addCase(admindeleteContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(admindeleteContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.uuid !== action.payload);
      })
      .addCase(admindeleteContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete content';
      })
      .addCase(adminbulkDeleteContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminbulkDeleteContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => !action.payload.includes(item.uuid));
      })
      .addCase(adminbulkDeleteContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to bulk delete content';
      });
      
  }
});

export const { setFilters, clearFilters } = adminModuleSlice.actions;
export default adminModuleSlice.reducer;