import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUserDashboardPermissions = createAsyncThunk(
    "userDashboardConfig/fetchUserDashboardPermissions",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await api.get("api/globalAdmin/getUserDashboardPermissions");
            // console.log(response.data.data)
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchUserAllowedPermissions = createAsyncThunk(
    "userDashboardConfig/fetchUserAllowedPermissions",
    async (orgId, { rejectWithValue }) => {
        try {
            const response = await api.get(`api/globalAdmin/getUserDashboardConfig/${orgId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const updateUserDashboardConfig = createAsyncThunk(
    "userDashboardConfig/updateUserDashboardConfig",
    async ({permissionId,orgId}, { rejectWithValue }) => {
        try {
            const response = await api.put(`api/globalAdmin/updateUserDashboardConfig/${orgId}`, {id:permissionId});
            // console.log(response.data.data)
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);


const userDashboardConfigSlice = createSlice({
    name: "userDashboardConfig",
    initialState: {
        permissions: [],
        userDashboardAllowedPermissions: [],
        loading: false,
        error: null,
        filters: {},
        totalCount: 0
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserDashboardPermissions.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchUserDashboardPermissions.fulfilled, (state, action) => {
            state.loading = false;
            state.permissions = action.payload;
        })
        .addCase(fetchUserDashboardPermissions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(fetchUserAllowedPermissions.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchUserAllowedPermissions.fulfilled, (state, action) => {
            state.loading = false;
            state.userDashboardAllowedPermissions = action.payload;
        })
        .addCase(fetchUserAllowedPermissions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(updateUserDashboardConfig.pending, (state) => {
            state.loading = true;
        })
        .addCase(updateUserDashboardConfig.fulfilled, (state, action) => {
            state.loading = false;
            state.userDashboardAllowedPermissions = action.payload;
            // state.permissions = action.payload;
        })
        .addCase(updateUserDashboardConfig.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    }
});

export default userDashboardConfigSlice.reducer;
export const { setFilters } = userDashboardConfigSlice.actions;

        

