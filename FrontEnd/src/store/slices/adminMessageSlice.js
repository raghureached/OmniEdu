import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiOld';

// Async thunks for message management
export const fetchAdminMessage = createAsyncThunk(
  'AdminMessage/fetchMessage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/getMessages');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateAdminMessage = createAsyncThunk(
  'AdminMessage/updateMessage',
  async (messageText, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/setMessage', { message: messageText });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteAdminMessage = createAsyncThunk(
  'AdminMessage/deleteMessage',
  async (id, { rejectWithValue }) => {
    try {

      await api.delete(`/api/admin/deleteMessage/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const messageSlice = createSlice({
  name: 'adminMessages',
  initialState: {
    currentMessages: [],
    loading: false,
    error: null,
    posting:false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessages = action.payload;
      })
      .addCase(fetchAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.posting=true
      })
      .addCase(updateAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.currentMessages.push(action.payload);
        state.posting=false
      })
      .addCase(updateAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteAdminMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdminMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessages = state.currentMessages.filter((msg) => msg.uuid !== action.payload);
      })
      .addCase(deleteAdminMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default messageSlice.reducer;