import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../services/api";



export const fetchAdminDashboardPermissions = createAsyncThunk(
    "adminDashboardConfig/fetchAdminDashboardPermissions",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await api.get("api/globalAdmin/getAdminDashboardPermissions");
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchAdminAllowedPermissions = createAsyncThunk(
    "adminDashboardConfig/fetchAdminAllowedPermissions",
    async (orgId, { rejectWithValue }) => {
        try {
            // console.log(orgId)
            const response = await api.get(`api/globalAdmin/getAdminDashboardConfig/${orgId}`);
            // console.log(response.data.data)
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)
export const updateAdminDashboardConfig = createAsyncThunk(
    "adminDashboardConfig/updateAdminDashboardConfig",
    async ({permissionId, orgId}, { rejectWithValue }) => {
        try {
            const response = await api.put(`api/globalAdmin/updateAdminDashboardConfig/${orgId}`, { id:permissionId });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)


const adminDashboardConfigSlice = createSlice({
    name: "adminDashboardConfig",
    initialState: {
        permissions: [],
        adminAllowedPermissions:[],
        loading: false,
        error: null,
        filters: {},
        totalCount: 0
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {};
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch admin dashboard permissions
            .addCase(fetchAdminDashboardPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminDashboardPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.permissions = action.payload;
                state.totalCount = action.payload.length;
            })
            .addCase(fetchAdminDashboardPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch admin dashboard permissions';
            })
            .addCase(fetchAdminAllowedPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminAllowedPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.adminAllowedPermissions = action.payload;
                state.totalCount = action.payload.length;
            })
            .addCase(fetchAdminAllowedPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch admin allowed permissions';
            })
            .addCase(updateAdminDashboardConfig.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAdminDashboardConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.adminAllowedPermissions = action.payload;
                state.totalCount = action.payload.length;
            })
            .addCase(updateAdminDashboardConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to update admin allowed permissions';
            })
        ;
    }
});

export const { setFilters, clearFilters } = adminDashboardConfigSlice.actions;
export default adminDashboardConfigSlice.reducer;

    
