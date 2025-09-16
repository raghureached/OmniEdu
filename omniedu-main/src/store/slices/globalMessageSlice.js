import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch all messages
export const fetchMessages = createAsyncThunk(
    'message/fetchMessage',
    async (orgId, { rejectWithValue }) => {
        try {
            console.log(orgId)
            const response = await api.post('/api/globalAdmin/getMessage', {orgId});
            //   console.log(response.data.data);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Post a new message
export const sendMessage = createAsyncThunk(
  'message/updateMessage',
  async ({ messageText, orgId }, { rejectWithValue }) => {
    try {
      console.log(messageText);
      const response = await api.post('/api/globalAdmin/setMessage', {
        message: messageText,
        orgId,
      });
      return response.data.data; // assuming backend returns saved message object
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// Delete all messages (or specific if backend supports it)
export const deleteMessage = createAsyncThunk(
    'message/deleteMessage',
    async (id, { rejectWithValue }) => {
        try {
            // console.log(id)
            const res = await api.delete(`/api/globalAdmin/deleteMessage/${id}`);
            // console.log(res)
            return id; // return the deleted message id
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const globalMessageSlice = createSlice({
    name: 'message',
    initialState: {
        currentMessages: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchMessages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.loading = false;
                state.currentMessages = action.payload;
                // console.log(state.currentMessages)
                // console.log(action.payload)
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update (Post new message)
            .addCase(sendMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false;
                // ✅ append to messages array
                state.currentMessages.push(action.payload);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMessage.fulfilled, (state, action) => {
                state.loading = false;
                // ✅ remove deleted message by id
                state.currentMessages = state.currentMessages.filter(
                    (msg) => msg.uuid !== action.payload
                );
            })
            .addCase(deleteMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default globalMessageSlice.reducer;
