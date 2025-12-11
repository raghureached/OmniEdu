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

// ============ NEW THUNKS FOR USER TICKET DETAILS & COMMENTS ============

/**
 * Fetch complete user ticket details including conversation thread
 */
export const fetchUserTicketDetails = createAsyncThunk(
  'userTickets/fetchDetails',
  async (ticketId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/user/getTicketDetails/${ticketId}`);
      return res.data?.data; // Should include: ticket info + conversation array
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch ticket details' });
    }
  }
);

/**
 * Add a comment/reply to a user ticket
 */
export const addUserTicketComment = createAsyncThunk(
  'userTickets/addComment',
  async ({ ticketId, message, attachments = [] }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/user/addTicketComment/${ticketId}`, {
        message,
        attachments
      });
      return res.data?.data; // Should return the full updated ticket
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to add comment' });
    }
  }
);

const userTicketsSlice = createSlice({
  name: 'userTickets',
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
      })
      
      // ============ NEW: Fetch ticket details ============
      .addCase(fetchUserTicketDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTicketDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchUserTicketDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload?.message || 'Failed to fetch ticket details';
      })
      
      // ============ NEW: Add comment ============
      .addCase(addUserTicketComment.pending, (state) => {
        state.commentSending = true;
        state.error = null;
      })
      .addCase(addUserTicketComment.fulfilled, (state, action) => {
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
      .addCase(addUserTicketComment.rejected, (state, action) => {
        state.commentSending = false;
        state.error = action.payload?.message || 'Failed to add comment';
      });
  },
});

export const { clearCurrentTicket } = userTicketsSlice.actions;
export default userTicketsSlice.reducer;