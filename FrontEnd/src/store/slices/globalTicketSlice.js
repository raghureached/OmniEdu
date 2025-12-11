import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Thunks
export const fetchUserTickets = createAsyncThunk(
  'userTickets/fetchAll',
  async ({ page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      // console.log('Fetching user tickets with params:', { page, limit });
      const res = await api.get('/api/globalAdmin/user/getTickets', { params: { page, limit } });
    //   console.log('User tickets API response:', res.data);
      const result = {
        items: res.data?.data || [],
        pagination: {
          page: res.data?.page || page,
          limit: res.data?.limit || limit,
          total: res.data?.total || 0,
          totalPages: Math.ceil((res.data?.total || 0) / (res.data?.limit || limit))
        }
      };
    //   console.log('Processed user tickets result:', result);
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
      const res = await api.get('/api/globalAdmin/user/getTicketStats');
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
      const res = await api.post('/api/globalAdmin/user/createTicket', payload);
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
      const res = await api.put(`/api/globalAdmin/user/updateTicketStatus/${ticketId}`, { status });
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
      await api.delete(`/api/globalAdmin/user/deleteTicket/${ticketId}`);
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
      const res = await api.put(`/api/globalAdmin/user/updateTicket/${ticketId}`, data);
      return res.data?.data; // updated ticket
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update ticket' });
    }
  }
);

// Admin Tickets Thunks
export const fetchAdminTickets = createAsyncThunk(
  'adminTickets/fetchAll',
  async ({ page = 1, limit = 6 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/globalAdmin/admin/getTickets', { params: { page, limit } });
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
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch admin tickets' });
    }
  }
);

export const fetchAdminTicketStats = createAsyncThunk(
  'adminTickets/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/globalAdmin/admin/getTicketStats');
      return res.data?.data || { open: 0, resolved: 0, inProgress: 0 };
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to fetch admin ticket stats' });
    }
  }
);

export const createAdminTicket = createAsyncThunk(
  'adminTickets/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/globalAdmin/admin/createTicket', payload);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to create admin ticket' });
    }
  }
);

export const updateAdminTicketStatus = createAsyncThunk(
  'adminTickets/updateStatus',
  async ({ ticketId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/globalAdmin/admin/updateTicketStatus/${ticketId}`, { status });
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update admin ticket status' });
    }
  }
);

export const deleteAdminTicket = createAsyncThunk(
  'adminTickets/delete',
  async (ticketId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/globalAdmin/admin/deleteTicket/${ticketId}`);
      return ticketId;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to delete admin ticket' });
    }
  }
);

export const updateAdminTicket = createAsyncThunk(
  'adminTickets/update',
  async ({ ticketId, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/globalAdmin/admin/updateTicket/${ticketId}`, data);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { message: 'Failed to update admin ticket' });
    }
  }
);

const globalTicketSlice = createSlice({
  name: 'globalTickets',
  initialState: {
    loading: false,
    error: null,
    userLoading: false,
    adminLoading: false,
    admin:{
        items: [],
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
    user:{
        items: [],
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
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdminTickets.pending, (state) => {
        state.adminLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTickets.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.admin.items = action.payload.items;
        state.admin.pagination = action.payload.pagination;
        // console.log(action.payload.items)
      })
      .addCase(fetchAdminTickets.rejected, (state, action) => {
        state.adminLoading = false;
        state.error = action.payload?.message || 'Failed to fetch tickets';
      })
      .addCase(fetchUserTickets.pending, (state) => {
        state.userLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.userLoading = false;
        state.user.items = action.payload.items;
        state.user.pagination = action.payload.pagination;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.userLoading = false;
        state.error = action.payload?.message || 'Failed to fetch tickets';
      })
      // create
      .addCase(createUserTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUserTicket.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.user.items.unshift(action.payload);
      })
      .addCase(createUserTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create ticket';
      })
      // update status
      .addCase(updateUserTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.user.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.user.items[idx] = updated;
      })
      .addCase(updateUserTicketStatus.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update status';
      })
      // delete
      .addCase(deleteUserTicket.fulfilled, (state, action) => {
        const id = action.payload;
        state.user.items = state.user.items.filter((t) => t.ticketId !== id);
      })
      .addCase(deleteUserTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete ticket';
      })
      // update ticket details
      .addCase(updateUserTicket.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.user.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.user.items[idx] = updated;
      })
      .addCase(updateUserTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update ticket';
      })
      // Admin tickets create
      .addCase(createAdminTicket.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAdminTicket.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.admin.items.unshift(action.payload);
      })
      .addCase(createAdminTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create admin ticket';
      })
      // Admin tickets update status
      .addCase(updateAdminTicketStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.admin.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.admin.items[idx] = updated;
      })
      .addCase(updateAdminTicketStatus.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update admin ticket status';
      })
      // Admin tickets delete
      .addCase(deleteAdminTicket.fulfilled, (state, action) => {
        const id = action.payload;
        state.admin.items = state.admin.items.filter((t) => t.ticketId !== id);
      })
      .addCase(deleteAdminTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete admin ticket';
      })
      // Admin tickets update details
      .addCase(updateAdminTicket.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.admin.items.findIndex((t) => t.ticketId === updated.ticketId);
        if (idx !== -1) state.admin.items[idx] = updated;
      })
      .addCase(updateAdminTicket.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to update admin ticket';
      })
      // Stats
      .addCase(fetchUserTicketStats.fulfilled, (state, action) => {
        state.user.stats = action.payload;
      })
      .addCase(fetchUserTicketStats.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to fetch user ticket stats';
      })
      .addCase(fetchAdminTicketStats.fulfilled, (state, action) => {
        state.admin.stats = action.payload;
      })
      .addCase(fetchAdminTicketStats.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to fetch admin ticket stats';
      });
  },
});

export default globalTicketSlice.reducer;