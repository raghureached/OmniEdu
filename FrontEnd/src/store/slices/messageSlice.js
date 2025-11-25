import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for message management
export const fetchMessages = createAsyncThunk(
  'message/fetchMessage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('api/user/getMessages');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMessage = createAsyncThunk(
  'message/updateMessage',
  async (messageText, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/message', { message: messageText });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/admin/message');
      return null;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    currentMessage: '',
    loading: false,
    error: null,
    posting:false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessage = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.posting=true
      })
      .addCase(updateMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMessage = action.payload;
        state.posting=false
      })
      .addCase(updateMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state) => {
        state.loading = false;
        state.currentMessage = '';
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default messageSlice.reducer;