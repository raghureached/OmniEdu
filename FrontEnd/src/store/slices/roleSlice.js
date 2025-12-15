

// ✅ roleSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// ------------------- THUNKS -------------------

// Fetch Roles
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (currentOrg ,{ rejectWithValue }) => {
    try {
      if(!currentOrg){
        return rejectWithValue("No organization provided");
      }
      const endpoint = `/api/globalAdmin/getRoles/${currentOrg}`
      const response = await api.get(endpoint);
      // console.log(response.data)
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
      const endpoint = '/api/globalAdmin/addRole'
      const response = await api.post(endpoint, roleData);
      // console.log(response.data)
      return response.data.data;
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

export const updateOrgRole = createAsyncThunk(
  'roles/updateOrgRole',
  async ({ id, orgId }, { rejectWithValue }) => {
    try {
      console.log(id,orgId)
      const endpoint = `/api/globalAdmin/editOrgRole/${orgId}`
      const response = await api.put(endpoint, {id});
      return response.data.data;
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
      // console.log(response.data)
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
    orgRoles: [],
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
        if (action.meta.arg === "global") {
          state.globalRoles = action.payload;
          // console.log(state.globalRoles)
        } else {
          state.orgRoles = action.payload;
          // console.log(state.orgRoles)
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
        state.globalRoles.push(action.payload)
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
          // const index = state.globalRoles.findIndex(
          //   (role) => String(role.uuid) === String(action.payload.uuid)
          // );
          // if (index !== -1) state.globalRoles[index] = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update role';
      })

      .addCase(updateOrgRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrgRole.fulfilled, (state, action) => {
        state.loading = false;
        // console.log(state.globalRoles)
        state.orgRoles = action.payload
      })
      .addCase(updateOrgRole.rejected, (state, action) => {
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
