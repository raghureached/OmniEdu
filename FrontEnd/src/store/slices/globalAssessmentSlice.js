import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGlobalAssessments = createAsyncThunk(
  'globalAssessments/fetchGlobalAssessments',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/globalAdmin/getAssessments', { params: filters });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Alias for search; calls the same endpoint with filters or query
export const searchGlobalAssessments = createAsyncThunk(
  'globalAssessments/searchGlobalAssessments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/globalAdmin/getAssessments', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete an existing global assessment by uuid
export const deleteGlobalAssessment = createAsyncThunk(
  'globalAssessments/deleteGlobalAssessment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/globalAdmin/deleteAssessment/${id}`);
      return response.data.data; // deleted assessment
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new global assessment
export const createGlobalAssessment = createAsyncThunk(
  'globalAssessments/createGlobalAssessment',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/globalAdmin/createAssessment', payload);
      // Controller returns { isSuccess, message, data: assessment, errors }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update an existing global assessment by uuid
export const updateGlobalAssessment = createAsyncThunk(
  'globalAssessments/updateGlobalAssessment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Backend expects req.params.id to be the uuid
      const response = await api.put(`/api/globalAdmin/editAssessment/${id}`, data);
      return response.data.data; // updated assessment
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get assessment by id (uuid)
export const getGlobalAssessmentById = createAsyncThunk(
  'globalAssessments/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/globalAdmin/getAssessmentById/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch all questions for an assessment
export const fetchAssessmentQuestions = createAsyncThunk(
  'globalAssessments/fetchQuestions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/globalAdmin/getQuestions/${id}`);
      return response.data.data; // array of questions
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch random questions for an assessment
export const fetchRandomAssessmentQuestions = createAsyncThunk(
  'globalAssessments/fetchRandomQuestions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/globalAdmin/getQuestionsRandom/${id}`);
      return response.data.data; // array of questions
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Edit a single question by uuid
export const editAssessmentQuestion = createAsyncThunk(
  'globalAssessments/editQuestion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/globalAdmin/editQuestion/${id}`, data);
      return response.data.data; // updated question
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a single question by uuid
export const deleteAssessmentQuestion = createAsyncThunk(
  'globalAssessments/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/globalAdmin/deleteQuestion/${id}`);
      return response.data.data; // deleted question
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Upload an assessment CSV
export const uploadAssessmentCSV = createAsyncThunk(
  'globalAssessments/uploadAssessmentCSV',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/globalAdmin/uploadAssessmentCSV', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data; // keep raw to inspect any errors array
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Upload a file (image/video/audio/pdf) for a question
export const uploadAssessmentFile = createAsyncThunk(
  'globalAssessments/uploadAssessmentFile',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/globalAdmin/uploadFile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // backend returns { isSuccess, url }
      return response.data.url || response.data.data?.url;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const globalAssessmentSlice = createSlice({
  name: 'globalAssessments',
  initialState: {
    assessments: [],
    loading: false,
    error: null,
    filters: {},
    totalCount: 0,
    selectedAssessment: null,
    questions: [],
    uploadUrl: ''
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
      .addCase(fetchGlobalAssessments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGlobalAssessments.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.assessments = action.payload;
      })
      .addCase(fetchGlobalAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search (same as fetch with filters)
      .addCase(searchGlobalAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchGlobalAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload || [];
      })
      .addCase(searchGlobalAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Assessment
      .addCase(createGlobalAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGlobalAssessment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Prepend the newly created assessment
          state.assessments = [action.payload, ...state.assessments];
          state.totalCount = (state.totalCount || 0) + 1;
        }
      })
      .addCase(createGlobalAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Assessment
      .addCase(updateGlobalAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGlobalAssessment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated) return;
        const key = updated.uuid || updated._id || updated.id;
        const idx = state.assessments.findIndex(a => (a.uuid || a._id || a.id) === key);
        if (idx !== -1) {
          state.assessments[idx] = updated;
        } else {
          // fallback: push it
          state.assessments.unshift(updated);
        }
      })
      .addCase(updateGlobalAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Assessment
      .addCase(deleteGlobalAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGlobalAssessment.fulfilled, (state, action) => {
        state.loading = false;
        const deleted = action.payload;
        if (!deleted) return;
        const key = deleted.uuid || deleted._id || deleted.id;
        state.assessments = state.assessments.filter(a => (a.uuid || a._id || a.id) !== key);
        state.totalCount = Math.max(0, (state.totalCount || 0) - 1);
      })
      .addCase(deleteGlobalAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get assessment by id
      .addCase(getGlobalAssessmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedAssessment = null;
      })
      .addCase(getGlobalAssessmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAssessment = action.payload || null;
      })
      .addCase(getGlobalAssessmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Questions list
      .addCase(fetchAssessmentQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.questions = [];
      })
      .addCase(fetchAssessmentQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload || [];
      })
      .addCase(fetchAssessmentQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Random questions
      .addCase(fetchRandomAssessmentQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRandomAssessmentQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload || [];
      })
      .addCase(fetchRandomAssessmentQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit question
      .addCase(editAssessmentQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAssessmentQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (!updated) return;
        const key = updated.uuid || updated._id || updated.id;
        const idx = state.questions.findIndex(q => (q.uuid || q._id || q.id) === key);
        if (idx !== -1) state.questions[idx] = updated;
      })
      .addCase(editAssessmentQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete question
      .addCase(deleteAssessmentQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessmentQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const deleted = action.payload;
        if (!deleted) return;
        const key = deleted.uuid || deleted._id || deleted.id;
        state.questions = state.questions.filter(q => (q.uuid || q._id || q.id) !== key);
      })
      .addCase(deleteAssessmentQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload CSV
      .addCase(uploadAssessmentCSV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAssessmentCSV.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadAssessmentCSV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload file
      .addCase(uploadAssessmentFile.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadAssessmentFile.fulfilled, (state, action) => {
        state.uploadUrl = action.payload || '';
      })
      .addCase(uploadAssessmentFile.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { setFilters, clearFilters } = globalAssessmentSlice.actions;

export default globalAssessmentSlice.reducer;

// Aliases matching backend/controller naming the user requested
export {
  // assessments
  createGlobalAssessment as createAssessment,
  fetchGlobalAssessments as getAssessments,
  searchGlobalAssessments as searchAssessment,
  updateGlobalAssessment as editAssessment,
  deleteGlobalAssessment as deleteAssessment,
  getGlobalAssessmentById as getAssessmentById,
  // questions
  fetchAssessmentQuestions as getQuestions,
  fetchRandomAssessmentQuestions as getQuestionsRandom,
  editAssessmentQuestion as editQuestion,
  deleteAssessmentQuestion as deleteQuestion,
  // uploads
  uploadAssessmentFile as fileUploadHandler,
};
