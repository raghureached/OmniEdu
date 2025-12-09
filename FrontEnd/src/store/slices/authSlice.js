
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Normalize backend role into app canonical role values
const normalizeRole = (role) => {
  if (!role) return null;
  const r = String(role).toLowerCase().replace(/[^a-z]/g, '');
  if (r === 'globaladmin') return 'GlobalAdmin';
  if (r === 'administrator') return 'Administrator';
  if (r === 'generaluser') return 'User';
  return null;
};

// Helper functions for localStorage
const loadAuthState = () => {
  try {
    const authState = localStorage.getItem('authState');
    return authState ? JSON.parse(authState) : null;
  } catch (error) {
    console.error('Error loading auth state from localStorage', error);
    return null;
  }
};

const saveAuthState = (state) => {
  try {
    const stateToPersist = {
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      role: state.role,
      lastLoginDateTime: state.lastLoginDateTime,
      token: state.token
    };
    localStorage.setItem('authState', JSON.stringify(stateToPersist));
  } catch (error) {
    console.error('Error saving auth state to localStorage', error);
  }
};

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_,{rejectWithValue}) => {
  try {
    const response = await api.post('/auth/checkAuth');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
})

// Async thunks for authentication
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Step 1: attempt login (sets httpOnly cookies on success)
      await api.post('/auth/login', { email, password });
      // Step 2: verify session via cookie-based check
      const verify = await api.post('/auth/checkAuth');
      // console.log(verify.data.role)
      return {
        ...verify.data,
        lastLoginDateTime: new Date().toISOString(),
      };
    } catch (error) {
      const payload = error?.response?.data || { message: 'Login failed' };
      return rejectWithValue(payload);
    }
  }
);

export const loginWithSSO = createAsyncThunk(
  'auth/loginWithSSO',
  async (provider, { rejectWithValue }) => {
    try {
      await api.post('/auth/sso', { provider });
      const verify = await api.post('/auth/checkAuth');
      return {
        ...verify.data,
        lastLoginDateTime: new Date().toISOString(),
      };
    } catch (error) {
      const payload = error?.response?.data || { message: 'SSO login failed' };
      return rejectWithValue(payload);
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
  // Clear auth data from localStorage
  localStorage.removeItem('authState');
  try {
    const logoutResponse = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return logoutResponse.data;
  } catch (error) {
    console.log(error)
    console.log('Logout API call failed, but continuing logout process');
    return null;
  }
});

// Get persisted state from localStorage and normalize
const persistedStateRaw = loadAuthState();
const persistedState = persistedStateRaw
  ? {
      ...persistedStateRaw,
      role: normalizeRole(persistedStateRaw.role),
    }
  : null;

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: persistedState || {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    resetPasswordSuccess: false,
    forgotPasswordSuccess: false,
    lastLoginDateTime: null,
    sessionStartTime: null,
    role: null
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
        state.user = action.payload.data;
        {
          const userData = action.payload?.data || {};
          const incomingRole = action.payload?.role
            || userData?.role
            || (Array.isArray(userData?.roles) && userData.roles.length ? userData.roles[0] : null);
          state.role = normalizeRole(incomingRole);
        }
        state.lastLoginDateTime = action.payload.data.last_login;
        state.sessionStartTime = new Date().toISOString();
        saveAuthState(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
        {
          const userData = action.payload?.data || {};
          const incomingRole = action.payload?.role
            || userData?.role
            || (Array.isArray(userData?.roles) && userData.roles.length ? userData.roles[0] : null);
          state.role = normalizeRole(incomingRole);
        }
        state.lastLoginDateTime = action.payload.data.last_login;
        state.sessionStartTime = new Date().toISOString();
        saveAuthState(state);
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload?.message || 'Login failed';
        // Clear persisted auth to avoid infinite checkAuth loops
        try {
          localStorage.removeItem('authState');
          localStorage.removeItem('token');
        } catch (_) {}
      })
      
      // SSO Login
      .addCase(loginWithSSO.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithSSO.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
        {
          const userData = action.payload?.data || {};
          const incomingRole = action.payload?.role
            || userData?.role
            || (Array.isArray(userData?.roles) && userData.roles.length ? userData.roles[0] : null);
          state.role = normalizeRole(incomingRole);
        }
        state.lastLoginDateTime = action.payload.lastLoginDateTime;
        state.sessionStartTime = new Date().toISOString();
        saveAuthState(state);
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
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.isAuthenticated = false;
        state.lastLoginDateTime = null;
        state.sessionStartTime = null;
        state.role = null;
      })
  },
});

export const { clearError, clearResetSuccess, clearForgotSuccess, updateSessionTime } = authSlice.actions;
export default authSlice.reducer;