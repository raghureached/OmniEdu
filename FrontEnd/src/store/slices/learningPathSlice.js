import {createSlice,createAsyncThunk} from "@reduxjs/toolkit";
import api from "../../services/api";

export const addLearningPath = createAsyncThunk("learningPath/addLearningPath", async (learningPath, { rejectWithValue }) => {
    try {
        const form = new FormData();
        // Primitive fields
        const primitives = [
            'title','description','prerequisite','team','subteam','category','trainingType','status','version'
        ];
        primitives.forEach((k) => {
            if (learningPath[k] !== undefined && learningPath[k] !== null) form.append(k, learningPath[k]);
        });
        // Numeric selects
        ['duration','credits','badges','stars'].forEach((k) => {
            if (learningPath[k] !== undefined && learningPath[k] !== null) form.append(k, String(learningPath[k]));
        });
        // Booleans
        ['enforceOrder','bypassRewards','enableFeedback'].forEach((k) => {
            if (typeof learningPath[k] !== 'undefined') form.append(k, learningPath[k] ? 'true' : 'false');
        });
        // Tags array
        if (Array.isArray(learningPath.tags)) form.append('tags', JSON.stringify(learningPath.tags));
        // Lessons array of objects
        if (Array.isArray(learningPath.lessons)) form.append('lessons', JSON.stringify(learningPath.lessons));
        // Thumbnail file or URL
        if (learningPath.thumbnail instanceof File) {
            form.append('thumbnail', learningPath.thumbnail);
        } else if (typeof learningPath.thumbnail === 'string' && learningPath.thumbnail) {
            // backend expects uploaded file for new create; keep as is if provided URL
            form.append('thumbnail_url', learningPath.thumbnail);
        }

        const response = await api.post("/api/admin/addLearningPath", form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { isSuccess: false, message: error.message });
    }
});
export const editLearningPath = createAsyncThunk("learningPath/editLearningPath", async (learningPath, { rejectWithValue }) => {
    try {
        const form = new FormData();
        const primitives = [
            'title','description','prerequisite','team','subteam','category','trainingType','status','version'
        ];
        primitives.forEach((k) => {
            if (learningPath[k] !== undefined && learningPath[k] !== null) form.append(k, learningPath[k]);
        });
        ['duration','credits','badges','stars'].forEach((k) => {
            if (learningPath[k] !== undefined && learningPath[k] !== null) form.append(k, String(learningPath[k]));
        });
        ['enforceOrder','bypassRewards','enableFeedback'].forEach((k) => {
            if (typeof learningPath[k] !== 'undefined') form.append(k, learningPath[k] ? 'true' : 'false');
        });
        if (Array.isArray(learningPath.tags)) form.append('tags', JSON.stringify(learningPath.tags));
        if (Array.isArray(learningPath.lessons)) form.append('lessons', JSON.stringify(learningPath.lessons));
        if (learningPath.thumbnail instanceof File) {
            form.append('thumbnail', learningPath.thumbnail);
        } else if (typeof learningPath.thumbnail === 'string' && learningPath.thumbnail) {
            form.append('thumbnail', learningPath.thumbnail);
        }

        const response = await api.put(`/api/admin/editLearningPath/${learningPath.uuid}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    } catch (error) {
        return error.response?.data || { isSuccess: false, message: error.message };
    }
});

export const getLearningPaths = createAsyncThunk("learningPath/getLearningPaths", async () => {
    try {
        const response = await api.get("/api/admin/getLearningPaths");
        return response.data.data;
    } catch (error) {
        return error.response?.data || { isSuccess: false, message: error.message };
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
