import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Mock users for testing (remove in production)
const mockUsers = {
  'globaladmin': {  // Changed from globaladmin to 'globaladmin'
    id: 1,
    username: 'globaladmin',
    email: 'globaladmin@example.com',
    firstName: 'Global',
    lastName: 'Admin',
    roles: ['global-admin'],
    password: 'Admin@123' // In a real app, never store plain text passwords
  },
  'orgadmin': {  // Changed from orgadmin to 'orgadmin'
    id: 2,
    username: 'orgadmin',
    email: 'orgadmin@example.com',
    firstName: 'Org',
    lastName: 'Admin',
    roles: ['admin'],
    organizationId: 1,
    password: 'Admin@123'
  },
  'testuser': {  // Changed from testuser to 'testuser'
    id: 3,
    username: 'testuser',
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    roles: ['user'],
    organizationId: 1,
    password: 'User@123'
  }
};

// For development/testing only
export const mockLogin = createAsyncThunk(
  'auth/mockLogin',
  async ({ username, password }, { rejectWithValue }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find user by username regardless of case
    const user = Object.values(mockUsers).find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (!user || user.password !== password) {
      return rejectWithValue({ message: 'Invalid username or password' });
    }
    
    // Create a mock token
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
      lastLoginDateTime: new Date().toISOString()
    };
  }
);

// Async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      return {
        ...response.data,
        lastLoginDateTime: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const loginWithSSO = createAsyncThunk(
  'auth/loginWithSSO',
  async (provider, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/sso', { provider });
      return {
        ...response.data,
        lastLoginDateTime: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Silently handle API errors during logout
    console.log('Logout API call failed, but continuing logout process');
  }
  return null;
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    resetPasswordSuccess: false,
    forgotPasswordSuccess: false,
    lastLoginDateTime: null,
    sessionStartTime: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResetSuccess: (state) => {
      state.resetPasswordSuccess = false;
    },
    clearForgotSuccess: (state) => {
      state.forgotPasswordSuccess = false;
    },
    updateSessionTime: (state) => {
      // Update session time to track how long user has been active
      if (!state.sessionStartTime && state.isAuthenticated) {
        state.sessionStartTime = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.lastLoginDateTime = action.payload.lastLoginDateTime;
        state.sessionStartTime = new Date().toISOString();
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // Mock Login
      .addCase(mockLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mockLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.lastLoginDateTime = action.payload.lastLoginDateTime;
        state.sessionStartTime = new Date().toISOString();
        // Store token in localStorage for consistency with real login
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(mockLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // SSO Login
      .addCase(loginWithSSO.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithSSO.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.lastLoginDateTime = action.payload.lastLoginDateTime;
        state.sessionStartTime = new Date().toISOString();
      })
      .addCase(loginWithSSO.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'SSO login failed';
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.forgotPasswordSuccess = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send reset email';
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reset password';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.lastLoginDateTime = null;
        state.sessionStartTime = null;
      });
  },
});

export const { clearError, clearResetSuccess, clearForgotSuccess, updateSessionTime } = authSlice.actions;
export default authSlice.reducer;