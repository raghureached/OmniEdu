import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../services/api";

export const addLearningPath = createAsyncThunk("learningPath/addLearningPath", async (learningPath) => {
    try {
        console.log(learningPath);
        const response = await api.post("/api/admin/addLearningPath", learningPath);
        console.log(response.data)
        return response.data.data;
    } catch (error) {
        console.log(error.response.data)
        return error.response.data;
    }
});
export const editLearningPath = createAsyncThunk("learningPath/editLearningPath", async (learningPath) => {
    try {
        console.log(learningPath);
        const response = await api.put(`/api/admin/editLearningPath/${learningPath.uuid}`, learningPath,{headers:{"Content-Type":"multipart/form-data"}});
        console.log(response.data)
        return response.data.data;
    } catch (error) {
        console.log(error.response.data)
        return error.response.data;
    }
});

export const getLearningPaths = createAsyncThunk("learningPath/getLearningPaths", async () => {
    try {
        const response = await api.get("/api/admin/getLearningpaths");
        console.log(response.data)
        return response.data.data;
    } catch (error) {
        console.log(error.response.data)
        return error.response.data;
    }
});
export const getLearningPathById = createAsyncThunk("learningPath/getLearningPathById", async (learningPathId) => {
    try {
        console.log(learningPathId);
        const response = await api.get(`/api/admin/getLearningPathById/${learningPathId}`);
        console.log(response.data)
        return response.data.data;
    } catch (error) {
        console.log(error.response.data)
        return error.response.data;
    }
})
export const deleteLearningPath = createAsyncThunk("learningPath/deleteLearningPath", async (learningPathId) => {
    try {
        console.log(learningPathId);
        const response = await api.delete(`/api/admin/deleteLearningPath/${learningPathId}`);
        console.log(response.data)
        return response.data.data;
    } catch (error) {
        console.log(error.response.data)
        return error.response.data;
    }
});


const learningPathSlice = createSlice({
    name: "learningPath",
    initialState: {
        learningPaths: [],
        loading: false,
        error: null,
        selectedPath: null,
    },
    reducers: {
        setSelectedPath: (state, action) => {
            state.selectedPath = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(addLearningPath.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(addLearningPath.fulfilled, (state, action) => {
            
            state.learningPaths.push(action.payload);
            state.loading =false
        });
        builder.addCase(addLearningPath.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(getLearningPaths.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getLearningPaths.fulfilled, (state, action) => {

            state.learningPaths = action.payload;
            state.loading =false
        });
        builder.addCase(getLearningPaths.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(editLearningPath.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(editLearningPath.fulfilled, (state, action) => {
            state.learningPaths = state.learningPaths.map((lp) => (lp.uuid === action.payload.uuid ? action.payload : lp));
            state.loading =false
        });
        builder.addCase(editLearningPath.rejected, (state) => {
            state.loading = false;
        });
        builder.addCase(deleteLearningPath.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteLearningPath.fulfilled, (state, action) => {
            state.learningPaths = state.learningPaths.filter((lp) => lp.uuid !== action.payload.uuid);
            state.loading =false
        });
        builder.addCase(deleteLearningPath.rejected, (state) => {
            state.loading = false;
        });
    },
});


export default learningPathSlice.reducer;
export const { setSelectedPath } = learningPathSlice.actions;
