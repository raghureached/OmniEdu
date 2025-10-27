import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for user management
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/getUsers', { params: filters })
      // console.log(response.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/addUser', userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/editUser/${id}`, userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteUser/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const bulkDeleteUsers = createAsyncThunk(
  'users/bulkDeleteUsers',
  async (ids, { rejectWithValue }) => {
    try {
      await api.post('/api/admin/bulkDeleteUsers', { ids });
      return ids;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const bulkUpdateUserGroup = createAsyncThunk(
  'users/bulkUpdateUserGroup',
  async ({ ids, groupData }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/bulkUpdateUserGroup', { ids, groupData });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const importUsers = createAsyncThunk(
  'users/importUsers',
  async (fileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      
      const response = await api.post('/api/admin/importUsers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const exportUsers = createAsyncThunk(
  'users/exportUsers',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/exportUsers', { 
        params: filters,
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    totalCount: 0,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    filters: {},
    selectedUsers: [],
    importSuccess: false,
    exportSuccess: false,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    selectUser: (state, action) => {
      state.selectedUsers.push(action.payload);
    },
    deselectUser: (state, action) => {
      state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
    },
    selectAllUsers: (state) => {
      state.selectedUsers = state.users.map(user => user.id);
    },
    deselectAllUsers: (state) => {
      state.selectedUsers = [];
    },
    clearUserError: (state) => {
      state.error = null;
    },
    clearImportSuccess: (state) => {
      state.importSuccess = false;
    },
    clearExportSuccess: (state) => {
      state.exportSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch users';
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.users.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create user';
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user';
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.uuid !== action.payload);
        state.totalCount -= 1;
        state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete user';
      })
      
      // Bulk Delete Users
      .addCase(bulkDeleteUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => !action.payload.includes(user.uuid));
        state.totalCount -= action.payload.length;
        state.selectedUsers = [];
      })
      .addCase(bulkDeleteUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete users';
      })
      
      // Bulk Update User Group
      .addCase(bulkUpdateUserGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateUserGroup.fulfilled, (state, action) => {
        state.loading = false;
        // Update users with new group data
        action.payload.forEach(updatedUser => {
          const index = state.users.findIndex(user => user.uuid === updatedUser.uuid);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        });
        state.selectedUsers = [];
      })
      .addCase(bulkUpdateUserGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user groups';
      })
      
      // Import Users
      .addCase(importUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.importSuccess = false;
      })
      .addCase(importUsers.fulfilled, (state) => {
        state.loading = false;
        state.importSuccess = true;
      })
      .addCase(importUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to import users';
      })
      
      // Export Users
      .addCase(exportUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.exportSuccess = false;
      })
      .addCase(exportUsers.fulfilled, (state) => {
        state.loading = false;
        state.exportSuccess = true;
      })
      .addCase(exportUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to export users';
      });
  },
});

export const {
  setFilters,
  setCurrentPage,
  setPageSize,
  selectUser,
  deselectUser,
  selectAllUsers,
  deselectAllUsers,
  clearUserError,
  clearImportSuccess,
  clearExportSuccess,
} = userSlice.actions;

export default userSlice.reducer;