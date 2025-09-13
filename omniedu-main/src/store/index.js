import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import organizationReducer from './slices/organizationSlice';
import userReducer from './slices/userSlice';
import groupReducer from './slices/groupSlice';
import roleReducer from './slices/roleSlice';
import contentReducer from './slices/contentSlice';
import notificationReducer from './slices/notificationSlice';
import assignmentReducer from './slices/assignmentSlice';
import messageReducer from './slices/messageSlice';
import activityLogReducer from './slices/activityLogSlice';
import surveyReducer from './slices/surveySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    organizations: organizationReducer,
    users: userReducer,
    groups: groupReducer,
    roles: roleReducer,
    content: contentReducer,
    notifications: notificationReducer,
    assignments: assignmentReducer,
    message: messageReducer,
    activityLog: activityLogReducer,
    surveys: surveyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;