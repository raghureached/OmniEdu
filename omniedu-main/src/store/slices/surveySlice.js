// // src/store/slices/surveySlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../services/api";

// // Thunks
// export const fetchSurveys = createAsyncThunk(
//   "surveys/fetchSurveys",
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get("/api/globalAdmin/getSurveys");
//       return response.data.data; // backend returns { data: [...] }
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to fetch surveys");
//     }
//   }
// );

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
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/globalAdmin/getSurveys");
      return response.data.data; // backend returns { data: [...] }
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

// Initial state
const initialState = {
  surveys: [],
  loading: false,
  error: null,
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
        state.surveys = action.payload;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.surveys.push(action.payload);
      })

      // Update
      .addCase(updateSurvey.fulfilled, (state, action) => {
        const idx = state.surveys.findIndex((s) => s.uuid === action.payload.uuid);
        if (idx !== -1) {
          state.surveys[idx] = action.payload;
        }
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

