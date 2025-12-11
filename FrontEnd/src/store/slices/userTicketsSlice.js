import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const fetchUserTickets = createAsyncThunk(
  'userTickets/fetchAll',
  async ({ page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching user tickets with params:', { page, limit });
      const res = await api.get('/api/user/getTickets', { params: { page, limit } });
      console.log('User tickets API response:', res.data);
      const result = {
        items: res.data?.data || [],
        pagination: {
          page: res.data?.page || page,
          limit: res.data?.limit || limit,
          total: res.data?.total || 0,
          totalPages: Math.ceil((res.data?.total || 0) / (res.data?.limit || limit))
        }
      };
      console.log('Processed user tickets result:', result);
      return result;
      
    } catch (err) {
      console.error('User tickets API error:', err);
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch user tickets' });
    }
  }
);

export const fetchUserTicketStats = createAsyncThunk(
  'userTickets/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/user/getTicketStats');
      return res.data?.data || { open: 0, resolved: 0, inProgress: 0 };
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch user ticket stats' });
    }
  }
);

export const createUserTicket = createAsyncThunk(
  'userTickets/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/user/createTicket', payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to create ticket' });
    }
  }
);

export const updateUserTicketStatus = createAsyncThunk(
  'userTickets/updateStatus',
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/user/updateTicketStatus/${ticketId}`, { status });
      return res.data?.data; // updated ticket
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update status' });
    }
  }
);

export const deleteUserTicket = createAsyncThunk(
  'userTickets/delete',
  async (ticketId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/user/deleteTicket/${ticketId}`);
      return ticketId;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to delete ticket' });
    }
  }
);

// Update ticket details (subject/description/errorMessage/attachments)
export const updateUserTicket = createAsyncThunk(
  'userTickets/update',
  async ({ ticketId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/user/updateTicket/${ticketId}`, data);
      return res.data?.data; // updated ticket
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update ticket' });
    }
  }
);

const userTicketsSlice = createSlice({
  name: 'userTickets',
  initialState: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 6,
      total: 0,
      totalPages: 1,
    },
    stats: {
      open: 0,
      resolved: 0,
      inProgress: 0,
    },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tickets';
      })
      // create
      .addCase(createUserTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUserTicket.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(createUserTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create ticket';
      })
      // update status
      .addCase(updateUserTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(updateUserTicketStatus.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update status';
      })
      // delete
      .addCase(deleteUserTicket.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((t) => t.ticketId !== id);
      })
      .addCase(deleteUserTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete ticket';
      })
      // update ticket details
      .addCase(updateUserTicket.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(updateUserTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update ticket';
      })
      // fetch stats
      .addCase(fetchUserTicketStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUserTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchUserTicketStats.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to fetch ticket stats';
      });
  },
});

export default userTicketsSlice.reducer;