import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPermissions = createAsyncThunk(
    'role/fetchPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/api/getPermissions');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Initial state
const initialState = {
    permissions: [],
    loading: false,
    error: null,
};

const RolePermissionSlice = createSlice({
    name: 'rolePermissions',
    initialState,
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.loading = false;
                // console.log(action.payload)
                state.permissions = action.payload;
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const {} = RolePermissionSlice.actions;
export default RolePermissionSlice.reducer;