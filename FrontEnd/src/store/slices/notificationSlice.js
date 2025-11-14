import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiOld';

// Sample notifications for testing
const initialNotifications = [
  {
    id: 1,
    title: 'New Course Available',
    message: 'A new course "Advanced React Patterns" is now available.',
    date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
    type: 'course'
  },
  {
    id: 2,
    title: 'Assignment Due',
    message: 'Your assignment for "JavaScript Fundamentals" is due tomorrow.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false,
    type: 'assignment'
  },
  {
    id: 3,
    title: 'Certificate Ready',
    message: 'Your certificate for "CSS Mastery" is ready to download.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: false,
    type: 'certificate'
  }
];

// Async thunk for fetching notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/notifications');
      // return response.data;
      
      // For now, return mock data
      return initialNotifications;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch notifications');
    }
  }
);

// Async thunk for marking a notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.patch(`/notifications/${notificationId}`, { read: true });
      // return response.data;
      
      // For now, return the ID
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark notification as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(notification => !notification.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(item => item.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;