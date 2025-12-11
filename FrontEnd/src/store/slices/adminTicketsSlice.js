import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Existing thunks...
export const fetchAdminTickets = createAsyncThunk(
  'adminTickets/fetchAll',
  async ({ page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/admin/getTickets', { params: { page, limit } });
      const result = {
        items: res.data?.data || [],
        pagination: {
          page: res.data?.page || page,
          limit: res.data?.limit || limit,
          total: res.data?.total || 0,
          totalPages: Math.ceil((res.data?.total || 0) / (res.data?.limit || limit))
        }
      };
      return result;
    } catch (err) {
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
      return res.data?.data;
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

export const updateAdminTicket = createAsyncThunk(
  'adminTickets/update',
  async ({ ticketId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/updateTicket/${ticketId}`, data);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update ticket' });
    }
  }
);

// ============ NEW THUNKS FOR TICKET DETAILS & COMMENTS ============

/**
 * Fetch complete ticket details including conversation thread
 */
export const fetchAdminTicketDetails = createAsyncThunk(
  'adminTickets/fetchDetails',
  async (ticketId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/getTicketDetails/${ticketId}`);
      return res.data?.data; // Should include: ticket info + conversation array
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch ticket details' });
    }
  }
);

/**
 * Add a comment/reply to a ticket
 */
export const addAdminTicketComment = createAsyncThunk(
  'adminTickets/addComment',
  async ({ ticketId, message, attachments = [] }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/admin/addTicketComment/${ticketId}`, {
        message,
        attachments
      });
      return res.data?.data; // Should return the new comment object
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to add comment' });
    }
  }
);

const adminTicketsSlice = createSlice({
  name: 'adminTickets',
  initialState: {
    items: [],
    currentTicket: null, // For storing detailed ticket view
    loading: false,
    detailsLoading: false,
    commentSending: false,
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
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets list
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
      
      // Create ticket
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
      
      // Update status
      .addCase(updateAdminTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.items[idx] = updated;
        if (state.currentTicket?.ticketId === updated.ticketId) {
          state.currentTicket = { ...state.currentTicket, status: updated.status };
        }
      })
      .addCase(updateAdminTicketStatus.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update status';
      })
      
      // Delete ticket
      .addCase(deleteAdminTicket.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((t) => t.ticketId !== id);
        if (state.currentTicket?.ticketId === id) {
          state.currentTicket = null;
        }
      })
      .addCase(deleteAdminTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete ticket';
      })
      
      // Update ticket
      .addCase(updateAdminTicket.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(updateAdminTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update ticket';
      })
      
      // Fetch stats
      .addCase(fetchAdminTicketStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchAdminTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchAdminTicketStats.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to fetch ticket stats';
      })
      
      // ============ NEW: Fetch ticket details ============
      .addCase(fetchAdminTicketDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTicketDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchAdminTicketDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload?.message || 'Failed to fetch ticket details';
      })
      
      // ============ NEW: Add comment ============
      .addCase(addAdminTicketComment.pending, (state) => {
        state.commentSending = true;
        state.error = null;
      })
      .addCase(addAdminTicketComment.fulfilled, (state, action) => {
        state.commentSending = false;
        // Update current ticket with full updated ticket data
        if (state.currentTicket && action.payload) {
          state.currentTicket = action.payload;
        }
        // Also update the ticket in the items list
        if (action.payload && action.payload.ticketId) {
          const idx = state.items.findIndex((t) => t.ticketId === action.payload.ticketId);
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      })
      .addCase(addAdminTicketComment.rejected, (state, action) => {
        state.commentSending = false;
        state.error = action.payload?.message || 'Failed to add comment';
      });
  },
});

export const { clearCurrentTicket } = adminTicketsSlice.actions;
export default adminTicketsSlice.reducer;