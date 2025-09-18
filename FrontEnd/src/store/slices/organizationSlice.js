import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
// import bpo from "../../../images/bpo.png"
// import sales from "../../../images/sales.png"
// import it from "../../../images/it.jpg"


// Async thunks for organization management
export const fetchOrganizations = createAsyncThunk(
    'organizations/fetchOrganizations',
    async(filters, { rejectWithValue }) => {
        try {
            const response = await api.get(
              "/api/globalAdmin/getOrganizations",
              { params: filters }
            );    
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchOrganizationById = createAsyncThunk(
    'organizations/fetchOrganizationById',
    async(id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/globalAdmin/getOrganizationById/${id}`);
            // console.log(response.data.data)
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// export const createOrganization = createAsyncThunk(
//     'organizations/createOrganization',
//     async(organizationData, { rejectWithValue }) => {
//         try {
//             // Handle file upload for logo if present
//             let formData = null;
//             if (organizationData.logo instanceof File) {
//                 formData = new FormData();
//                 Object.keys(organizationData).forEach(key => {
//                     if (key === 'logo') {
//                         formData.append('logo', organizationData.logo);
//                     } else {
//                         formData.append(key, organizationData[key]);
//                     }
//                 });
//             }

//             const response = await api.post(
//               "/api/globalAdmin/addOrganization",
//               formData || organizationData,
//               formData
//                 ? { headers: { "Content-Type": "multipart/form-data" } }
//                 : {}
//           );
//           console.log(formData)
//           console.log(response.data)
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.response.data);
//         }
//     }
// );

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (organizationData, { rejectWithValue }) => {
    try {
      console.log(organizationData)
      const formData = new FormData();
      // Append all fields properly
      Object.keys(organizationData).forEach((key) => {
        const value = organizationData[key];

        if (value instanceof File) {
          // Single file (logo)
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          // Multiple files (documents) or array of text
          value.forEach((item) => {
            if (item instanceof File) {
              formData.append(key, item); // multiple files
            } else {
              formData.append(`${key}[]`, item); // array of text values
            }
          });
        } else if (typeof value === "object" && value !== null) {
          // JSON object
          formData.append(key, JSON.stringify(value));
        } else {
          // Simple text/number
          formData.append(key, value);
        }
      });

      // Debug: check what is being sent
      for (let [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(`${key}: ${val.name} (${val.type}, ${val.size} bytes)`);
        } else {
          console.log(`${key}: ${val}`);
        }
      }

      const response = await api.post(
        "/api/globalAdmin/addOrganization",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status,
        message: error.response?.data?.message || "Something went wrong",
      });
    }
  }
);



export const updateOrganization = createAsyncThunk(
    'organizations/updateOrganization',
    async({ id, data }, { rejectWithValue }) => {
        try {
            // Handle file upload for logo if present
            // console.log(data)
            // let formData = null;
            // if (data.logo instanceof File) {
            //     formData = new FormData();
            //     Object.keys(data).forEach(key => {
            //       // console.log(key, data[key]);
            //         if (key === 'logo') {
            //             formData.append('logo', data.logo);
            //         } else {
            //             formData.append(key, data[key]);
            //         }
            //     });
            // }
            // console.log('formData', formData)
            // console.log(data)
            const response = await api.put(
              `/api/globalAdmin/editOrganization/${id}`,
             data,
              data
                ? { headers: { "Content-Type": "multipart/form-data" } }
                : {}
            );
            // console.log('response', response)
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteOrganization = createAsyncThunk(
    'organizations/deleteOrganization',
    async(id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/api/globalAdmin/deleteOrganization/${id}`);
            // console.log(response.data)
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);
export const deleteOrganizations = createAsyncThunk(
    'organizations/deleteOrganizations',
    async(ids, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/api/globalAdmin/deleteOrganizations`, { data: { ids } });
            // console.log(response.data)
            return ids;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const uploadOrganizationDocument = createAsyncThunk(
    'organizations/uploadDocument',
    async({ orgId, document }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('document', document);

            const response = await api.post(
                `/organizations/${orgId}/documents`,
                formData, { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteOrganizationDocument = createAsyncThunk(
    'organizations/deleteDocument',
    async({ orgId, docId }, { rejectWithValue }) => {
        try {
            await api.delete(`/organizations/${orgId}/documents/${docId}`);
            return { orgId, docId };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Initial state
const initialState = {
    organizations: [],
    currentOrganization: null,
    loading: false,
    error: null,
    documentUploading: false,
    documentError: null,
    filters: {
        name: '',
        status: '',
        plan: ''
    },
    totalCount: 0
};

// Organization slice
const organizationSlice = createSlice({
    name: 'organizations',
    initialState,
    reducers: {
        setFilters: (state, action) => {
          // console.log("action.payload", action.payload)  
          // console.log("state.filters", state.filters)
            state.filters = {...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                name: '',
                status: '',
                planName: ''
            };
        },
        clearErrors: (state) => {
            state.error = null;
            state.documentError = null;
        }
    },
    extraReducers: (builder) => {
        builder
          // Fetch organizations
          .addCase(fetchOrganizations.pending, (state) => {
              state.loading = true;
              state.error = null;
          })
          .addCase(fetchOrganizations.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload || 'Failed to fetch organizations';
          })
          .addCase(fetchOrganizations.fulfilled, (state, action) => {
            state.loading = false;

            // Case 1: API returns { organizations: [], totalCount }
            if (action.payload.organizations) {
              state.organizations = action.payload.organizations;
              state.totalCount =
                action.payload.totalCount ||
                action.payload.organizations.length;
            }
            // Case 2: API returns { data: [] }
            else if (action.payload.data) {
              state.organizations = action.payload.data;
              state.totalCount = action.payload.data.length;
            }
            // Case 3: API returns just an array []
            else if (Array.isArray(action.payload)) {
              state.organizations = action.payload;
              state.totalCount = action.payload.length;
            } else {
              state.organizations = [];
              state.totalCount = 0;
            }
          }) 

          // Fetch organization by ID
          .addCase(fetchOrganizationById.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(fetchOrganizationById.fulfilled, (state, action) => {
            state.loading = false;
            // console.log(action.payload)
            state.currentOrganization = action.payload;
          })
          .addCase(fetchOrganizationById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to fetch organization";
          })

          // Create organization
          .addCase(createOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(createOrganization.fulfilled, (state, action) => {
            state.loading = false;
            console.log(action.payload)
            state.organizations.push(action.payload);
            state.totalCount += 1;
          })
          .addCase(createOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to create organization";
          })

          // Update organization
          .addCase(updateOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(updateOrganization.fulfilled, (state, action) => {
            state.loading = false;
            console.log(state,action.payload)
            const index = state.organizations.findIndex(
              (org) => org.uuid === action.payload.uuid
            );
            // console.log(index)
            if (index !== -1) {
              state.organizations[index] = action.payload;
              console.log(state.organizations[index])
            }
            if (
              state.currentOrganization &&
              state.currentOrganization.uuid=== action.payload.uuid
            ) {
              state.currentOrganization = action.payload;
            }
          })
          .addCase(updateOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to update organization";
          })

          // Delete organization
          .addCase(deleteOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(deleteOrganization.fulfilled, (state, action) => {
            state.loading = false;
            state.organizations = state.organizations.filter(
              (org) => org.uuid !== action.payload
            );
            state.totalCount -= 1;
            if (
              state.currentOrganization &&
              state.currentOrganization.uuid === action.payload
            ) {
              state.currentOrganization = null;
            }
          })
          .addCase(deleteOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to delete organization";
          })
          .addCase(deleteOrganizations.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(deleteOrganizations.fulfilled, (state, action) => {
            state.loading = false;
            state.organizations = state.organizations.filter(
              (org) => !action.payload.includes(org.uuid)
            );
            state.totalCount -= action.payload.length;
          })
          .addCase(deleteOrganizations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to delete organizations";
          })
          // Upload document
          .addCase(uploadOrganizationDocument.pending, (state) => {
            state.documentUploading = true;
            state.documentError = null;
          })
          .addCase(uploadOrganizationDocument.fulfilled, (state, action) => {
            state.documentUploading = false;
            if (
              state.currentOrganization &&
              state.currentOrganization.id === action.payload.organizationId
            ) {
              if (!state.currentOrganization.documents) {
                state.currentOrganization.documents = [];
              }
              state.currentOrganization.documents.push(action.payload.document);
            }
          })
          .addCase(uploadOrganizationDocument.rejected, (state, action) => {
            state.documentUploading = false;
            state.documentError = action.payload || "Failed to upload document";
          })

          // Delete document
          .addCase(deleteOrganizationDocument.fulfilled, (state, action) => {
            if (
              state.currentOrganization &&
              state.currentOrganization.id === action.payload.orgId
            ) {
              state.currentOrganization.documents =
                state.currentOrganization.documents.filter(
                  (doc) => doc.id !== action.payload.docId
                );
            }
          });
    }
});

export const { setFilters, clearFilters, clearErrors } = organizationSlice.actions;
export default organizationSlice.reducer;