// legacy commented code removed above for clarity

// export const createSurvey = createAsyncThunk(
//   "surveys/createSurvey",
//   async (surveyData, { rejectWithValue }) => {
//     try {
//       const response = await api.post("/api/globalAdmin/createSurvey", surveyData);
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to create survey");
//     }
//   }
// );

// export const updateSurvey = createAsyncThunk(
//   "surveys/updateSurvey",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await api.put(`/api/globalAdmin/editSurvey/${id}`, data);
//       return response.data.data.updatedSurvey;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to update survey");
//     }
//   }
// );

// export const deleteSurvey = createAsyncThunk(
//   "surveys/deleteSurvey",
//   async (id, { rejectWithValue }) => {
//     try {
//       await api.delete(`/api/globalAdmin/deleteSurvey/${id}`);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to delete survey");
//     }
//   }
// );

// // Initial state
// const initialState = {
//   surveys: [],
//   loading: false,
//   error: null,
// };

// const surveySlice = createSlice({
//   name: "surveys",
//   initialState,
//   reducers: {
//     clearSurveyError: (state) => {
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch
//       .addCase(fetchSurveys.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchSurveys.fulfilled, (state, action) => {
//         state.loading = false;
//         state.surveys = action.payload;
//       })
//       .addCase(fetchSurveys.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Create
//       .addCase(createSurvey.fulfilled, (state, action) => {
//         state.surveys.push(action.payload);
//       })

//       // Update
//       .addCase(updateSurvey.fulfilled, (state, action) => {
//         const idx = state.surveys.findIndex((s) => s._id === action.payload._id);
//         if (idx !== -1) {
//           state.surveys[idx] = action.payload;
//         }
//       })

//       // Delete
//       .addCase(deleteSurvey.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteSurvey.fulfilled, (state, action) => {
//         state.loading = false;
//         state.surveys = state.surveys.filter((s) => s.uuid !== action.payload);
//       })
//       .addCase(deleteSurvey.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearSurveyError } = surveySlice.actions;
// export default surveySlice.reducer;

// src/store/slices/surveySlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Thunks
export const fetchSurveys = createAsyncThunk(
  "surveys/fetchSurveys",
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/globalAdmin/getSurveys", { params: { page, limit } });
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
      const response = await api.post("/api/globalAdmin/createSurvey", surveyData);
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
      const response = await api.put(`/api/globalAdmin/editSurvey/${uuid}`, data);
      return response.data.data.updatedSurvey; // backend returns { updatedSurvey, questions }
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update survey");
    }
  }
);

export const deleteSurvey = createAsyncThunk(
  "surveys/deleteSurvey",
  async (uuid, { rejectWithValue }) => {
    try {
      await api.delete(`/api/globalAdmin/deleteSurvey/${uuid}`);
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
      const response = await api.get(`/api/globalAdmin/getSurvey/${uuid}`);
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

