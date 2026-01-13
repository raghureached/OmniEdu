
// src/store/slices/surveySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Thunks
export const fetchSurveys = createAsyncThunk(
  "surveys/fetchSurveys",
  async ({ page = 1, limit = 50, team, subteam } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (team && team !== '' && team !== 'all') {
        params.team = team;
      }
      if (subteam && subteam !== '' && subteam !== 'all') {
        params.subteam = subteam;
      }
      const response = await api.get("/api/admin/getSurveys", { params });
      // backend returns { success, message, data: surveys, pagination }
     
      return { list: response.data.data, pagination: response.data.pagination };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch surveys");
    }
  }
);

export const createSurvey = createAsyncThunk(
  "surveys/createSurvey",
  async (surveyData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admin/createSurvey", surveyData);
     
      return response.data.data; // survey with uuid from backend
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create survey");
    }
  }
);

export const updateSurvey = createAsyncThunk(
  "surveys/updateSurvey",
  async ({ uuid, data }, { rejectWithValue }) => {
    try {
      //console.log('🔄 updateSurvey thunk called with:', { uuid, data });
      const response = await api.put(`/api/admin/editSurvey/${uuid}`, data);
      //console.log('✅ updateSurvey API response:', response.data);

      if (!response.data) {
        throw new Error('Empty response from server');
      }

      if (!response.data.data) {
        console.error('❌ No data field in response:', response.data);
        throw new Error('Invalid response structure: missing data field');
      }

      // Handle both response formats: with and without updatedSurvey wrapper
      let result;
      if (response.data.data.updatedSurvey) {
        result = response.data.data.updatedSurvey;
       // console.log('✅ Using updatedSurvey field:', result);
      } else {
        // Backend returns survey data directly in data field
        result = response.data.data;
        //console.log('✅ Using data field directly:', result);
      }

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid survey data returned from server');
      }

     // console.log('✅ updateSurvey returning:', result);
      return result;
    } catch (error) {
      //console.error('❌ updateSurvey thunk error:', error);
      return rejectWithValue(error.response?.data || error.message || "Failed to update survey");
    }
  }
);

export const deleteSurvey = createAsyncThunk(
  "surveys/deleteSurvey",
  async (uuid, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteSurvey/${uuid}`);
      return uuid; // return the deleted uuid
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete survey");
    }
  }
);

export const getSurveyById = createAsyncThunk(
  "surveys/getSurveyById",
  async (uuid, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/admin/getSurvey/${uuid}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch survey");
    }
  }
);

// Initial state
const initialState = {
  surveys: [],
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, limit: 50, totalPages: 0, hasNextPage: false },
  current: null,
  creating:false,
  updating:false,
  deleting:false
};

const surveySlice = createSlice({
  name: "surveys",
  initialState,
  reducers: {
    clearSurveyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSurveys.pending, (state) => {
        state.loading = true;
        
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.loading = false;
        state.surveys = action.payload.list || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSurvey.pending, (state) => {
        state.creating = true;
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.creating = false;
        state.surveys.push(action.payload);
       
      })
      .addCase(createSurvey.rejected,(state) => {
        state.creating = false;
      })
      // Update
      .addCase(updateSurvey.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateSurvey.fulfilled, (state, action) => {
        state.updating = false;
        const idx = state.surveys.findIndex((s) => s.uuid === action.payload.uuid);
        if (idx !== -1) {
          state.surveys[idx] = action.payload;
        }
      })
      .addCase(updateSurvey.rejected, (state) => {
        state.updating = false;
      })
      // Get by id
      .addCase(getSurveyById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSurveyById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(getSurveyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSurvey.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.surveys = state.surveys.filter((s) => s.uuid !== action.payload);
      })
      .addCase(deleteSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSurveyError } = surveySlice.actions;
export default surveySlice.reducer;

