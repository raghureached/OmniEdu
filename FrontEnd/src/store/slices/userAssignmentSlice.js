import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchUserAssignments = createAsyncThunk(
    "userAssignments/fetchUserAssignments",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await api.get("api/user/getUserAssignments");
            // console.log(response.data.data)
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);
export const fetchUserEnrollments = createAsyncThunk(
    "userAssignments/fetchUserEnrollments",
    async (filters, { rejectWithValue }) => {
        try {
            const response = await api.get("api/user/enrolledbyUser");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);





const userAssignmentSlice = createSlice({
    name: "userAssignment",
    initialState: {
        assignments: [],
        enrolled: [],
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
        builder.addCase(fetchUserAssignments.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchUserAssignments.fulfilled, (state, action) => {
            state.loading = false;
            state.assignments = action.payload;
        })
        .addCase(fetchUserAssignments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(fetchUserEnrollments.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchUserEnrollments.fulfilled, (state, action) => {
            state.loading = false;
            state.enrolled = action.payload;
        })
        .addCase(fetchUserEnrollments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })  
        
    }
});

export default userAssignmentSlice.reducer;
export const { setFilters } = userAssignmentSlice.actions;

        

