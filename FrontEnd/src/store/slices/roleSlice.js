// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api';

// // Async thunks for role management
// export const fetchRoles = createAsyncThunk(
//     'roles/fetchRoles',
//     async(isGlobalAdmin = false, { rejectWithValue }) => {
//         try {
//             const endpoint = isGlobalAdmin
//               ? "/api/globalAdmin/getRoles"
//               : "/admin/roles";
//             const response = await api.get(endpoint);
//             return response.data.data;
//         } catch (error) {
//             return rejectWithValue(error.response.data);
//         }
//     }
// );

// export const createRole = createAsyncThunk(
//     'roles/createRole',
//     async({ roleData, isGlobalAdmin = false }, { rejectWithValue }) => {
//         try {
//             const endpoint = isGlobalAdmin
//               ? "/api/globalAdmin/addRole"
//               : "/admin/roles";
//             const response = await api.post(endpoint, roleData);
//             return response.data.data;
//         } catch (error) {
//             return rejectWithValue(error.response.data);
//         }
//     }
// );

// export const updateRole = createAsyncThunk(
//     'roles/updateRole',
//     async({ _id, roleData, isGlobalAdmin = false }, { rejectWithValue }) => {
//         try {
//             const endpoint = isGlobalAdmin
//               ? `/api/globalAdmin/editRole/${_id}`
//               : `/admin/roles/${_id}`;
//             const response = await api.put(endpoint, roleData);
//             return response.data.data;
//         } catch (error) {
//             return rejectWithValue(error.response.data);
//         }
//     }
// );
// export const deleteRole = createAsyncThunk(
//   "roles/deleteRole",
//   async ({ id, isGlobalAdmin = false }, { rejectWithValue }) => {
//     try {
//       const endpoint = isGlobalAdmin
//         ? `/api/globalAdmin/deleteRole/${id}`
//         : `/admin/roles/${id}`;
//       const response = await api.delete(endpoint);
//       return { id: response.data.data._id, isGlobalAdmin }; // ✅ return deleted role id
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// // export const deleteRole = createAsyncThunk(
// //     'roles/deleteRole',
// //     async({ _id, isGlobalAdmin = false }, { rejectWithValue }) => {
// //         try {
// //             const endpoint = isGlobalAdmin ? `/global-admin/roles/${_id}` : `/admin/roles/${_id}`;
// //             await api.delete(endpoint);
// //             return { id: response.data._id, isGlobalAdmin };
// //         } catch (error) {
// //             return rejectWithValue(error.response.data);
// //         }
// //     }
// // );

// // // Role slice
// // const roleSlice = createSlice({
// //     name: 'roles',
// //     initialState: {
// //         adminRoles: [],
// //         globalRoles: [],
// //         loading: false,
// //         error: null,
// //     },
// //     reducers: {
// //         clearRoleError: (state) => {
// //             state.error = null;
// //         },
// //     },
// //     extraReducers: (builder) => {
// //         builder
// //         // Fetch Roles
// //             .addCase(fetchRoles.pending, (state) => {
// //                 state.loading = true;
// //                 state.error = null;
// //             })
// //             .addCase(fetchRoles.fulfilled, (state, action) => {
// //                 state.loading = false;
// //                 if (action.meta.arg) {
// //                     // Global admin roles
// //                     state.globalRoles = action.payload;
// //                 } else {
// //                     // Admin roles
// //                     state.adminRoles = action.payload;
// //                 }
// //             })
// //             .addCase(fetchRoles.rejected, (state, action) => {
// //                 state.loading = false;
// //                 state.error = action.payload ? .message || 'Failed to fetch roles';
// //             })

// //         // Create Role
// //         .addCase(createRole.pending, (state) => {
// //                 state.loading = true;
// //                 state.error = null;
// //             })
// //             .addCase(createRole.fulfilled, (state, action) => {
// //                 state.loading = false;
// //                 if (action.meta.arg.isGlobalAdmin) {
// //                     state.globalRoles.push(action.payload);
// //                 } else {
// //                     state.adminRoles.push(action.payload);
// //                 }
// //             })
// //             .addCase(createRole.rejected, (state, action) => {
// //                 state.loading = false;
// //                 state.error = action.payload ? .message || 'Failed to create role';
// //             })

// //         // Update Role
// //         .addCase(updateRole.pending, (state) => {
// //                 state.loading = true;
// //                 state.error = null;
// //             })
// //             .addCase(updateRole.fulfilled, (state, action) => {
// //                 state.loading = false;
// //                 if (action.meta.arg.isGlobalAdmin) {
// //                     const index = state.globalRoles.findIndex(role => role._id === action.payload._id);
// //                     if (index !== -1) {
// //                         state.globalRoles[index] = action.payload;
// //                     }
// //                 } else {
// //                     const index = state.adminRoles.findIndex(role => role._id === action.payload._id);
// //                     if (index !== -1) {
// //                         state.adminRoles[index] = action.payload;
// //                     }
// //                 }
// //             })
// //             .addCase(updateRole.rejected, (state, action) => {
// //                 state.loading = false;
// //                 state.error = action.payload ? .message || 'Failed to update role';
// //             })

// //         // Delete Role
// //         .addCase(deleteRole.pending, (state) => {
// //                 state.loading = true;
// //                 state.error = null;
// //             })
// //             .addCase(deleteRole.fulfilled, (state, action) => {
// //                 state.loading = false;
// //                 if (action.payload.isGlobalAdmin) {
// //                     state.globalRoles = state.globalRoles.filter(role => role._id !== action.payload._id);
// //                 } else {
// //                     state.adminRoles = state.adminRoles.filter(role => role._id !== action.payload._id);
// //                 }
// //             })
// //             .addCase(deleteRole.rejected, (state, action) => {
// //                 state.loading = false;
// //                 state.error = action.payload ? .message || 'Failed to delete role';
// //             });
// //     },
// // });

// const roleSlice = createSlice({
//     name: 'roles',
//     initialState: {
//         adminRoles: [],
//         globalRoles: [],
//         loading: false,
//         error: null,
//     },
//     reducers: {
//         clearRoleError: (state) => {
//             state.error = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//         // Fetch Roles
//             .addCase(fetchRoles.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(fetchRoles.fulfilled, (state, action) => {
//                 state.loading = false;
//                 if (action.meta.arg) {
//                     // Global admin roles
//                     state.globalRoles = action.payload;
//                 } else {
//                     // Admin roles
//                     state.adminRoles = action.payload;
//                 }
//             })
//             .addCase(fetchRoles.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload ?.message || 'Failed to fetch roles';
//             })

//         // Create Role
//         .addCase(createRole.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createRole.fulfilled, (state, action) => {
//                 state.loading = false;
//                 if (action.meta.arg.isGlobalAdmin) {
//                     state.globalRoles.push(action.payload);
//                 } else {
//                     state.adminRoles.push(action.payload);
//                 }
//             })
//             .addCase(createRole.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload ?.message || 'Failed to create role';
//             })

//         // Update Role
//         .addCase(updateRole.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(updateRole.fulfilled, (state, action) => {
//                 state.loading = false;
//                 if (action.meta.arg.isGlobalAdmin) {
//                     const index = state.globalRoles.findIndex(role => role._id === action.payload._id);
//                     if (index !== -1) {
//                         state.globalRoles[index] = action.payload;
//                     }
//                 } else {
//                     const index = state.adminRoles.findIndex(role => role._id === action.payload._id);
//                     if (index !== -1) {
//                         state.adminRoles[index] = action.payload;
//                     }
//                 }
//             })
//             .addCase(updateRole.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload ?.message || 'Failed to update role';
//             })

//         // Delete Role
//         .addCase(deleteRole.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(deleteRole.fulfilled, (state, action) => {
//                 state.loading = false;
//                 if (action.payload.isGlobalAdmin) {
//                     state.globalRoles = state.globalRoles.filter(role => role._id !== action.payload.id);
//                 } else {
//                     state.adminRoles = state.adminRoles.filter(role => role._id !== action.payload.id);
//                 }
//             })
//             .addCase(deleteRole.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload ?.message || 'Failed to delete role';
//             });
//     },
// });

// export const { clearRoleError } = roleSlice.actions;
// export default roleSlice.reducer;

// ✅ roleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ------------------- THUNKS -------------------

// Fetch Roles
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (currentOrg ,{ rejectWithValue }) => {
    try {
      // console.log(currentOrg)
      const endpoint = `/api/globalAdmin/getRoles/${currentOrg}`
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchPermissions = createAsyncThunk(
  'roles/fetchPermissions',
  async ( { rejectWithValue }) => {
    try {
      // console.log("fetching")
      const endpoint = '/api/globalAdmin/getPermissions'
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create Role
export const createRole = createAsyncThunk(
  'roles/createRole',
  async ({ roleData, isGlobalAdmin = false }, { rejectWithValue }) => {
    try {
      // console.log(roleData)
      const endpoint = '/api/globalAdmin/createRoleOrg'
      const response = await api.post(endpoint, roleData);
      // console.log(response.data)
      return response.data.role;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Update Role
export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ id, roleData }, { rejectWithValue }) => {
    try {
      const endpoint = `/api/globalAdmin/editRole/${id}`
      const response = await api.put(endpoint, roleData);
      return response.data.data; // updated role
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete Role
export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async ({ _id }, { rejectWithValue }) => {
    try {
      const endpoint = `/api/globalAdmin/deleteRole/${_id}`;
      const response = await api.delete(endpoint);
      // console.log(response.data.data._id)
      return response.data.data._id; // return deleted role id
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// ------------------- SLICE -------------------

const roleSlice = createSlice({
  name: 'roles',
  initialState: {
    adminRoles: [],
    globalRoles: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg) {
          state.globalRoles = action.payload;
        } else {
          state.adminRoles = action.payload;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch roles';
      })
      .addCase(fetchPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch permissions';
      })
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.isGlobalAdmin) {
          state.globalRoles.push(action.payload);
        } else {
          state.adminRoles.push(action.payload);
        }
        // console.log(action.payload)
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create role';
      })

      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
          const index = state.globalRoles.findIndex(
            (role) => role._id === action.payload._id
          );
          
          if (index !== -1) state.globalRoles[index] = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update role';
      })

      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.globalRoles = state.globalRoles.filter(
          (role) => role._id !== action.payload
        );
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete role';
      });
  },
});

export const { clearRoleError } = roleSlice.actions;
export default roleSlice.reducer;
