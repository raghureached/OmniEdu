import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const fetchAdminTickets = createAsyncThunk(
  'adminTickets/fetchAll',
  async ({ page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      console.log('Fetching tickets with params:', { page, limit });
      const res = await api.get('/api/admin/getTickets', { params: { page, limit } });
      console.log('API response:', res.data);
      // Controller returns: { isSuccess, message, data: tickets, page, limit, total }
      const result = {
        items: res.data?.data || [],
        pagination: {
          page: res.data?.page || page,
          limit: res.data?.limit || limit,
          total: res.data?.total || 0,
          totalPages: Math.ceil((res.data?.total || 0) / (res.data?.limit || limit))
        }
      };
      console.log('Processed result:', result);
      return result;
      
    } catch (err) {
      console.error('API error:', err);
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch tickets' });
    }
  }
);

export const fetchAdminTicketStats = createAsyncThunk(
  'adminTickets/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/admin/getTicketStats');
      return res.data?.data || { open: 0, resolved: 0, inProgress: 0 };
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch ticket stats' });
    }
  }
);

export const createAdminTicket = createAsyncThunk(
  'adminTickets/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/admin/createTicket', payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to create ticket' });
    }
  }
);

export const updateAdminTicketStatus = createAsyncThunk(
  'adminTickets/updateStatus',
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/updateTicketStatus/${ticketId}`, { status });
      return res.data?.data; // updated ticket
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update status' });
    }
  }
);

export const deleteAdminTicket = createAsyncThunk(
  'adminTickets/delete',
  async (ticketId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteTicket/${ticketId}`);
      return ticketId;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to delete ticket' });
    }
  }
);

// Update ticket details (subject/description/errorMessage/attachments)
export const updateAdminTicket = createAsyncThunk(
  'adminTickets/update',
  async ({ ticketId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/updateTicket/${ticketId}`, data);
      return res.data?.data; // updated ticket
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update ticket' });
    }
  }
);

const adminTicketsSlice = createSlice({
  name: 'adminTickets',
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
      .addCase(fetchAdminTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch tickets';
      })
      // create
      .addCase(createAdminTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAdminTicket.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(createAdminTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create ticket';
      })
      // update status
      .addCase(updateAdminTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(updateAdminTicketStatus.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update status';
      })
      // delete
      .addCase(deleteAdminTicket.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((t) => t.ticketId !== id);
      })
      .addCase(deleteAdminTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete ticket';
      })
      // update ticket details
      .addCase(updateAdminTicket.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(updateAdminTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update ticket';
      })
      // fetch stats
      .addCase(fetchAdminTicketStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAdminTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAdminTicketStats.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to fetch ticket stats';
      });
  },
});

export default adminTicketsSlice.reducer;
