import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for user management
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/getUsers', { params: filters })
      // console.log(response.data)
      return {
        users: response.data.data,
        pagination: response.data.pagination,
      };
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

// New: add selected users to a group (team/subteam)
export const addUsersToGroup = createAsyncThunk(
  'users/addUsersToGroup',
  async ({ team_id, sub_team_id, userIds }, { rejectWithValue }) => {
    try {
      const payload = { team_id, sub_team_id, userIds };
      const response = await api.post('/api/admin/addUsersToGroup', payload);
      return response.data.data; // contains counts
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
    totalPages: 1,
    hasMore: false,
    filters: {
      status: '',
      role: '',
      search: '',
      page: 1,
      limit: 6,
    },
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
    clearFilters: (state) => {
      state.filters = {
        status: '',
        role: '',
        search: '',
        page: 1,
        limit: state.pageSize || 6,
      };
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
        const payload = action.payload || {};
        const users = Array.isArray(payload.users) ? payload.users : [];
        const pagination = payload.pagination || {};
        const requestParams = action.meta?.arg || {};

        state.users = users;

        const resolvedLimit = typeof pagination.limit === 'number'
          ? pagination.limit
          : (typeof requestParams.limit === 'number' ? requestParams.limit : state.pageSize || users.length || 6);
        state.pageSize = resolvedLimit || state.pageSize;

        const resolvedPage = typeof pagination.page === 'number'
          ? pagination.page
          : (typeof requestParams.page === 'number' ? requestParams.page : state.currentPage || 1);
        state.currentPage = resolvedPage;

        const hasMore = typeof pagination.hasMore === 'boolean'
          ? pagination.hasMore
          : (users.length >= state.pageSize && users.length > 0);
        state.hasMore = hasMore;

        const derivedTotal = typeof pagination.total === 'number'
          ? pagination.total
          : (hasMore
            ? (resolvedPage * state.pageSize) + 1
            : ((resolvedPage - 1) * state.pageSize) + users.length);
        state.totalCount = derivedTotal;

        const resolvedTotalPages = typeof pagination.totalPages === 'number' && pagination.totalPages > 0
          ? pagination.totalPages
          : (hasMore ? resolvedPage + 1 : Math.max(1, Math.ceil(state.totalCount / state.pageSize)));
        state.totalPages = resolvedTotalPages;
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
        const payload = action.payload || {};
        const matchId = payload.id || payload.uuid || payload._id;
        if (!matchId) {
          return;
        }

        const index = state.users.findIndex(user => {
          const userId = user.id || user.uuid || user._id;
          return userId === matchId;
        });

        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            ...payload,
          };
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
      // Add Users To Group
      .addCase(addUsersToGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUsersToGroup.fulfilled, (state) => {
        state.loading = false;
        // We will refetch users in UI after success
      })
      .addCase(addUsersToGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add users to group';
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
  clearFilters,
} = userSlice.actions;

export default userSlice.reducer;