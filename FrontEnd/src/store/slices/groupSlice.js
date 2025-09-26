// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api';

// // Async thunks for group management
// export const fetchGroups = createAsyncThunk(
//   'groups/fetchGroups',
//   async (filters, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/groups', { params: filters });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const createGroup = createAsyncThunk(
//   'groups/createGroup',
//   async (groupData, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/groups', groupData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const updateGroup = createAsyncThunk(
//   'groups/updateGroup',
//   async ({ id, groupData }, { rejectWithValue }) => {
//     try {
//       const response = await api.put(`/groups/${id}`, groupData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const deleteGroup = createAsyncThunk(
//   'groups/deleteGroup',
//   async (id, { rejectWithValue }) => {
//     try {
//       await api.delete(`/groups/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const importGroups = createAsyncThunk(
//   'groups/importGroups',
//   async (fileData, { rejectWithValue }) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', fileData);
      
//       const response = await api.post('/groups/import', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// // Group slice
// const groupSlice = createSlice({
//   name: 'groups',
//   initialState: {
//     groups: [],
//     totalCount: 0,
//     loading: false,
//     error: null,
//     currentPage: 1,
//     pageSize: 10,
//     filters: {},
//     importSuccess: false,
//   },
//   reducers: {
//     setGroupFilters: (state, action) => {
//       state.filters = action.payload;
//     },
//     setGroupCurrentPage: (state, action) => {
//       state.currentPage = action.payload;
//     },
//     setGroupPageSize: (state, action) => {
//       state.pageSize = action.payload;
//     },
//     clearGroupError: (state) => {
//       state.error = null;
//     },
//     clearGroupImportSuccess: (state) => {
//       state.importSuccess = false;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Groups
//       .addCase(fetchGroups.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchGroups.fulfilled, (state, action) => {
//         state.loading = false;
//         state.groups = action.payload.groups;
//         state.totalCount = action.payload.totalCount;
//       })
//       .addCase(fetchGroups.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to fetch groups';
//       })
      
//       // Create Group
//       .addCase(createGroup.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createGroup.fulfilled, (state, action) => {
//         state.loading = false;
//         state.groups.push(action.payload);
//         state.totalCount += 1;
//       })
//       .addCase(createGroup.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to create group';
//       })
      
//       // Update Group
//       .addCase(updateGroup.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateGroup.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.groups.findIndex(group => group.id === action.payload.id);
//         if (index !== -1) {
//           state.groups[index] = action.payload;
//         }
//       })
//       .addCase(updateGroup.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to update group';
//       })
      
//       // Delete Group
//       .addCase(deleteGroup.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteGroup.fulfilled, (state, action) => {
//         state.loading = false;
//         state.groups = state.groups.filter(group => group.id !== action.payload);
//         state.totalCount -= 1;
//       })
//       .addCase(deleteGroup.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to delete group';
//       })
      
//       // Import Groups
//       .addCase(importGroups.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.importSuccess = false;
//       })
//       .addCase(importGroups.fulfilled, (state) => {
//         state.loading = false;
//         state.importSuccess = true;
//       })
//       .addCase(importGroups.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload?.message || 'Failed to import groups';
//       });
//   },
// });

// export const {
//   setGroupFilters,
//   setGroupCurrentPage,
//   setGroupPageSize,
//   clearGroupError,
//   clearGroupImportSuccess,
// } = groupSlice.actions;

// export default groupSlice.reducer;



///////updated for teams and subteams
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for group management
// export const fetchGroups = createAsyncThunk(
//   'groups/fetchGroups',
//   async (filters, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/api/admin/getGroups', { params: filters });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );
export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/getGroups", { params: filters });
      // return just the data (array of groups)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await api.post('/groups', groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, groupData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/groups/${id}`, groupData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/groups/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const importGroups = createAsyncThunk(
  'groups/importGroups',
  async (fileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      
      const response = await api.post('/groups/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Group slice
const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    totalCount: 0,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    filters: {},
    importSuccess: false,
  },
  reducers: {
    setGroupFilters: (state, action) => {
      state.filters = action.payload;
    },
    setGroupCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setGroupPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    clearGroupError: (state) => {
      state.error = null;
    },
    clearGroupImportSuccess: (state) => {
      state.importSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(fetchGroups.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.groups = action.payload.groups;
      //   state.totalCount = action.payload.totalCount;
      // })
      .addCase(fetchGroups.fulfilled, (state, action) => {
  state.loading = false;
  state.groups = action.payload;   // this is the array of groups
  state.totalCount = action.payload.length; // count them manually
  console.log("groups in slice", action.payload)
})

      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch groups';
      })
      
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create group';
      })
      
      // Update Group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update group';
      })
      
      // Delete Group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group.id !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete group';
      })
      
      // Import Groups
      .addCase(importGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.importSuccess = false;
      })
      .addCase(importGroups.fulfilled, (state) => {
        state.loading = false;
        state.importSuccess = true;
      })
      .addCase(importGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to import groups';
      });
  },
});

export const {
  setGroupFilters,
  setGroupCurrentPage,
  setGroupPageSize,
  clearGroupError,
  clearGroupImportSuccess,
} = groupSlice.actions;

export default groupSlice.reducer;