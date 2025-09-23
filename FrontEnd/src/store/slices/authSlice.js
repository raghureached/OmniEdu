// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api';

// // Mock users for testing (remove in production)
// const mockUsers = {
//   'globaladmin': {  // Changed from globaladmin to 'globaladmin'
//     id: 1,
//     username: 'globaladmin',
//     email: 'globaladmin@example.com',
//     firstName: 'Global',
//     lastName: 'Admin',
//     roles: ['global-admin'],
//     password: 'Admin@123' // In a real app, never store plain text passwords
//   },
//   'orgadmin': {  // Changed from orgadmin to 'orgadmin'
//     id: 2,
//     username: 'orgadmin',
//     email: 'orgadmin@example.com',
//     firstName: 'Org',
//     lastName: 'Admin',
//     roles: ['admin'],
//     organizationId: 1,
//     password: 'Admin@123'
//   },
//   'testuser': {  // Changed from testuser to 'testuser'
//     id: 3,
//     username: 'testuser',
//     email: 'testuser@example.com',
//     firstName: 'Test',
//     lastName: 'User',
//     roles: ['user'],
//     organizationId: 1,
//     password: 'User@123'
//   }
// };

// // For development/testing only
// export const mockLogin = createAsyncThunk(
//   'auth/mockLogin',
//   async ({ username, password }, { rejectWithValue }) => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 800));
    
//     // Find user by username regardless of case
//     const user = Object.values(mockUsers).find(
//       u => u.username.toLowerCase() === username.toLowerCase()
//     );
    
//     if (!user || user.password !== password) {
//       return rejectWithValue({ message: 'Invalid username or password' });
//     }
    
//     // Create a mock token
//     const token = `mock-jwt-token-${Date.now()}`;
    
//     // Remove password from returned user object
//     const { password: _, ...userWithoutPassword } = user;
    
//     return {
//       user: userWithoutPassword,
//       token,
//       lastLoginDateTime: new Date().toISOString()
//     };
//   }
// );

// export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
//   try {
//     const response = await api.post('/auth/checkAuth');
//     return response.data;
//   } catch (error) {
//     return rejectWithValue(error.response.data);
//   }
// });

// // Async thunks for authentication
// export const login = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/auth/login', { email, password });
//       return {
//         ...response.data,
//         lastLoginDateTime: new Date().toISOString()
//       };
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const loginWithSSO = createAsyncThunk(
//   'auth/loginWithSSO',
//   async (provider, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/auth/sso', { provider });
//       return {
//         ...response.data,
//         lastLoginDateTime: new Date().toISOString()
//       };
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const forgotPassword = createAsyncThunk(
//   'auth/forgotPassword',
//   async (email, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/auth/forgot-password', { email });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const resetPassword = createAsyncThunk(
//   'auth/resetPassword',
//   async ({ token, password }, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/auth/reset-password', { token, password });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const logout = createAsyncThunk('auth/logout', async () => {
//   try {
//     await api.post('/auth/logout');
//   } catch (error) {
//     console.log('Logout API call failed, but continuing logout process');
//   }
//   return null;
// });

// // Auth slice
// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     user: null,
//     isAuthenticated: false,
//     loading: false,
//     error: null,
//     resetPasswordSuccess: false,
//     forgotPasswordSuccess: false,
//     lastLoginDateTime: null,
//     sessionStartTime: null,
//     role: null
//   },
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     clearResetSuccess: (state) => {
//       state.resetPasswordSuccess = false;
//     },
//     clearForgotSuccess: (state) => {
//       state.forgotPasswordSuccess = false;
//     },
//     updateSessionTime: (state) => {
//       // Fixed: Only update if authenticated and sessionStartTime is not already set
//       if (state.isAuthenticated && !state.sessionStartTime) {
//         state.sessionStartTime = new Date().toISOString();
//       }
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login
//       .addCase(login.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.data;
//         state.role = action.payload.role;
//         state.lastLoginDateTime = action.payload.data.last_login;
//         state.sessionStartTime = new Date().toISOString();
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Login failed';
//       })
//       .addCase(checkAuth.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(checkAuth.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.data;
//         state.role = action.payload.role;
//         state.lastLoginDateTime = action.payload.data.last_login;
//         state.sessionStartTime = new Date().toISOString();
//       })
//       .addCase(checkAuth.rejected, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         state.role = null;
//         state.error = action.payload?.message || 'Login failed';
//       })
//       // SSO Login
//       .addCase(loginWithSSO.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginWithSSO.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.user;
//         state.token = action.payload.token;
//         state.lastLoginDateTime = action.payload.lastLoginDateTime;
//         state.sessionStartTime = new Date().toISOString();
//       })
//       .addCase(loginWithSSO.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'SSO login failed';
//       })
//       // Forgot Password
//       .addCase(forgotPassword.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.forgotPasswordSuccess = false;
//       })
//       .addCase(forgotPassword.fulfilled, (state) => {
//         state.loading = false;
//         state.forgotPasswordSuccess = true;
//       })
//       .addCase(forgotPassword.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to send reset email';
//       })
//       // Reset Password
//       .addCase(resetPassword.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.resetPasswordSuccess = false;
//       })
//       .addCase(resetPassword.fulfilled, (state) => {
//         state.loading = false;
//         state.resetPasswordSuccess = true;
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to reset password';
//       })
//       // Logout
//       .addCase(logout.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(logout.fulfilled, (state) => {
//         state.user = null;
//         state.token = null;
//         state.isAuthenticated = false;
//         state.lastLoginDateTime = null;
//         state.sessionStartTime = null;
//         state.loading = false; // Add this to stop loading state
//       })
//       .addCase(logout.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Logout failed';
//       });
//   },
// });

// export const { clearError, clearResetSuccess, clearForgotSuccess, updateSessionTime } = authSlice.actions;
// export default authSlice.reducer;



import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

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
      const response = await api.post('/auth/login', { email, password });
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
  // Clear auth data from localStorage
  localStorage.removeItem('authState');
  localStorage.removeItem('token');
  
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.log('Logout API call failed, but continuing logout process');
  }
  return null;
});

// Get persisted state from localStorage
const persistedState = loadAuthState();

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
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.lastLoginDateTime = action.payload.data.last_login;
        state.sessionStartTime = new Date().toISOString();
        // Save token to localStorage for API requests
        localStorage.setItem('token', action.payload.token);
        // Save auth state to localStorage
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
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.lastLoginDateTime = action.payload.data.last_login;
        state.sessionStartTime = new Date().toISOString();
        // Save token to localStorage for API requests
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
        // Save auth state to localStorage
        saveAuthState(state);
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
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
        
        // Store token in localStorage for API requests
        localStorage.setItem('token', action.payload.token);
        
        // Save auth state to localStorage
        saveAuthState(state);
      })
      .addCase(mockLogin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
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
        
        // Store token in localStorage for API requests
        localStorage.setItem('token', action.payload.token);
        
        // Save auth state to localStorage
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
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.lastLoginDateTime = null;
        state.sessionStartTime = null;
        state.role = null;
      });
  },
});

export const { clearError, clearResetSuccess, clearForgotSuccess, updateSessionTime } = authSlice.actions;
export default authSlice.reducer;