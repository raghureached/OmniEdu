import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for content management
export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('api/globalAdmin/getContent', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchContentById = createAsyncThunk(
  'content/fetchContentById',
  async (id, { rejectWithValue }) => {
    try {
      // console.log(id)
      const response = await api.get(`/api/globalAdmin/getContentById/${id}`);
      // console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createContent = createAsyncThunk(
  'content/createContent',
  async (moduleData, { rejectWithValue }) => {
    try {
      // Do not set Content-Type here!
      const response = await api.post('/api/globalAdmin/addcontent', moduleData,{headers:{'Content-Type':'multipart/form-data'}});
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      // console.log(updatedData)
      const response = await api.put(`/api/globalAdmin/editContent/${id}`, updatedData);
      // console.log(response.data.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/globalAdmin/deleteContent/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Content slice
const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    uploading: false,
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
      // Fetch content
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        // console.log(action.payload);
        
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch content';
      })
      .addCase(fetchContentById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedContent = action.payload;
      })
      .addCase(fetchContentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch content by id';
      })
      // Create content
      .addCase(createContent.pending, (state) => {
        state.loading = true;
        state.uploading = true;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.uploading = false;
      })
      .addCase(createContent.rejected, (state, action) => {
        state.loading = false;
        state.uploading = false;
        state.error = action.payload?.message || 'Failed to create content';
      })
      
      // Update content
      .addCase(updateContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateContent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update content';
      })
      
      // Delete content
      .addCase(deleteContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.loading = false;
        // console.log(action.payload);
        
        state.items = state.items.filter(item => item.uuid !== action.payload);
      })
      .addCase(deleteContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete content';
      });
  }
});

export const { setFilters, clearFilters } = contentSlice.actions;
export default contentSlice.reducer;