

///////updated for teams and subteams
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/getGroups", { params: filters });
      // return just the data (array of groups)
      // console.log(response.data.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      console.log(groupData)
      const response = await api.post('/api/admin/addGroup', groupData);
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/addTeam', teamData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
)
export const createSubTeam = createAsyncThunk(
  'subteams/createSubTeam',
  async (subTeamData, { rejectWithValue }) => {
    try {
      console.log(subTeamData)
      const response = await api.post(`/api/admin/addSubTeam`, subTeamData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
)
export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, teamData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/editTeam/${id}`, teamData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateSubTeam = createAsyncThunk(
  'subteams/updateSubTeam',
  async ({ id, subTeamData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/admin/editSubTeam/${id}`, subTeamData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
)

export const deleteSubTeam = createAsyncThunk(
  'subteams/deleteSubTeam',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteSubTeam/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
)

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admin/deleteGroup/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const importGroups = createAsyncThunk(
  'groups/importGroups',
  async (fileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', fileData);
      
      const response = await api.post('/groups/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Group slice
const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    totalCount: 0,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    filters: {},
    importSuccess: false,
  },
  reducers: {
    setGroupFilters: (state, action) => {
      state.filters = action.payload;
    },
    setGroupCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setGroupPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    clearGroupError: (state) => {
      state.error = null;
    },
    clearGroupImportSuccess: (state) => {
      state.importSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // .addCase(fetchGroups.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.groups = action.payload.groups;
      //   state.totalCount = action.payload.totalCount;
      // })
      .addCase(fetchGroups.fulfilled, (state, action) => {
  state.loading = false;
  state.groups = action.payload;   // this is the array of groups
  state.totalCount = action.payload.length; // count them manually
  console.log("groups in slice", action.payload)
})

      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch groups';
      })
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const team = payload.team || payload;
        if (!team || !team._id) {
          return;
        }
        const subTeam = payload.subTeam;
        const normalizedTeam = {
          ...team,
          subTeams: Array.isArray(team.subTeams)
            ? team.subTeams
            : (subTeam ? [subTeam] : []),
        };

        state.groups.push(normalizedTeam);
        state.totalCount += 1;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create team';
      })
      
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const team = payload.team || payload;
        if (!team || !team._id) {
          return;
        }
        const index = state.groups.findIndex(team => (team.id || team._id) === team._id);
        if (index === -1) {
          state.groups.push({
            ...team,
          });
          return;
        }
        const existing = state.groups[index];
        state.groups[index] = {
          ...existing,
          ...team,
        };
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update team';
      })
      .addCase(createSubTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubTeam.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        // Backend returns { team: subTeamObject }
        const subTeam = payload.team || payload;
        if (!subTeam || !subTeam._id) {
          return;
        }
        // Find the parent team and add the subteam to its subTeams array
        const teamIndex = state.groups.findIndex(team => (team.id || team._id) === subTeam.team_id);
        if (teamIndex !== -1) {
          const team = state.groups[teamIndex];
          state.groups[teamIndex] = {
            ...team,
            subTeams: Array.isArray(team.subTeams) 
              ? [...team.subTeams, subTeam]
              : [subTeam]
          };
        }
      })
      .addCase(createSubTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create subteam';
      })
      .addCase(updateSubTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubTeam.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        // Backend returns { subTeam: subTeamObject }
        const updatedSubTeam = payload.subTeam || payload;
        if (!updatedSubTeam || !updatedSubTeam._id) {
          return;
        }
        // Find the parent team and update the subteam in its subTeams array
        const teamIndex = state.groups.findIndex(team => (team.id || team._id) === updatedSubTeam.team_id);
        if (teamIndex !== -1) {
          const team = state.groups[teamIndex];
          state.groups[teamIndex] = {
            ...team,
            subTeams: Array.isArray(team.subTeams)
              ? team.subTeams.map(st => 
                  (st.uuid || st._id) === (updatedSubTeam.uuid || updatedSubTeam._id)
                    ? updatedSubTeam
                    : st
                )
              : [updatedSubTeam]
          };
        }
      })
      .addCase(updateSubTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update subteam';
      })
      
      // Delete SubTeam
      .addCase(deleteSubTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubTeam.fulfilled, (state, action) => {
        state.loading = false;
        const subTeamId = action.payload;
        // Remove the subteam from the appropriate team's subTeams array
        state.groups = state.groups.map(team => ({
          ...team,
          subTeams: Array.isArray(team.subTeams) 
            ? team.subTeams.filter(st => (st.uuid || st._id) !== subTeamId)
            : []
        }));
      })
      .addCase(deleteSubTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete subteam';
      })
      
      // Delete Group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = state.groups.filter(group => (group.id || group._id) !== action.payload);
        state.totalCount -= 1;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete group';
      })
      
      // Import Groups
      .addCase(importGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.importSuccess = false;
      })
      .addCase(importGroups.fulfilled, (state) => {
        state.loading = false;
        state.importSuccess = true;
      })
      .addCase(importGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to import groups';
      });
  },
});

export const {
  setGroupFilters,
  setGroupCurrentPage,
  setGroupPageSize,
  clearGroupError,
  clearGroupImportSuccess,
} = groupSlice.actions;

export default groupSlice.reducer;