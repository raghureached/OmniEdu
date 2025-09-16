import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// Import pages
import Login from './pages/auth/Login/Login';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import EmailConfirmation from './pages/auth/EmailConfirmation/EmailConfirmation';
// Import layouts
import UserLayout from './components/layouts/UserLayout/UserLayout';
import AdminLayout from './components/layouts/AdminLayout/AdminLayout';
import GlobalAdminLayout from './components/layouts/GlobalAdminLayout/GlobalAdminLayout';

// User Pages 
import UserProfile from './pages/user/UserProfile/UserProfile'; 
import LearningHub from './pages/user/LearningHub/LearningHub'; 
import Catalog from './pages/user/Catalog/Catalog'; 
import ActivityHistory from './pages/user/ActivityHistory/ActivityHistory'; 
import HelpCenter from './pages/user/HelpCenter/HelpCenter'; 
// Add the new imports for the missing components
import Assigned from './pages/user/Assigned/Assigned';
import Additional from './pages/user/Additional/Additional';
import Mandatory from './pages/user/Mandatory/Mandatory';

// Admin Pages 
import AdminHome from './pages/admin/AdminHome/AdminHome'; // Add this new import
import UsersManagement from './pages/admin/UsersManagement/UsersManagement'; 
import GroupsManagement from './pages/admin/GroupsManagement/GroupsManagement'; 
// import RolesManagement from './pages/admin/RolesManagement/RolesManagement'; 
import ContentModules from './pages/admin/ContentModules/ContentModules'; 
import ContentAssessments from './pages/admin/ContentAssessments/ContentAssessments'; 
import LearningPaths from './pages/admin/LearningPaths/LearningPaths'; 
import Surveys from './pages/admin/Surveys/Surveys'; 
import AdminProfile from './pages/admin/AdminProfile/AdminProfile';
import CreateAssignment from './pages/admin/CreateAssignment/CreateAssignment';
import ManageAssignment from './pages/admin/ManageAssignment/ManageAssignment';
import AdminHelpCenter from './pages/admin/AdminHelpCenter/AdminHelpCenter';
import AdminMessageBoard from './pages/admin/AdminMessageBoard/AdminMessageBoard';
import AdminActivityLog from './pages/admin/AdminActivityLog/AdminActivityLog';
import AdminPortalActivity from './pages/admin/AdminPortalActivity/AdminPortalActivity';

// Global Admin Pages 
import OrganizationManagement from './pages/globalAdmin/OrganizationManagement/OrganizationManagement';
import NewOrgManagement from './pages/globalAdmin/OrganizationManagement/NewOrgManagement';
import GlobalRolesManagement from './pages/globalAdmin/GlobalRolesManagement/GlobalRolesManagement'; 
import GlobalContentManagement from './pages/globalAdmin/GlobalContentManagement/GlobalContentManagement'; 
import GlobalSurveys from './pages/globalAdmin/GlobalSurveys/GlobalSurveys'; 
import GlobalPortalActivity from './pages/globalAdmin/GlobalAdminLibraryPortal/GlobalPortal';
// Import styles
import './App.css';

// Add this import at the top
import Dashboard from './pages/user/Dashboard/Dashboard';

// Add this near the top of your App.js file
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSessionTime } from './store/slices/authSlice';
import GlobalActivityLog from './pages/globalAdmin/GlobalActivityLog/GlobalActivityLog';
import GlobalHelpCenter from './pages/globalAdmin/GlobalHelpCenter/GlobalHelpCenter';
import GlobalProfile from './pages/globalAdmin/GlobalProfile/GlobalProfile';
import GlobalContentDetails from './pages/globalAdmin/GlobalContentManagement/GlobalContentDetail';
import GlobalMessageBoard from './pages/globalAdmin/GlobalMessageBoard/GlobalMessageBoard';
import LoadingScreen from './components/common/Loading/Loading';
import UserDashBoardConfig from './pages/globalAdmin/UserDashBoardConfig/UserDashBoardConfig';
import AdminDashBoardConfig from './pages/globalAdmin/AdminDashBoardConfig/AdminDashBoardConfig';
import GlobalCreateAssignment from './pages/globalAdmin/GlobalAssignments/CreateAssignment';



function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {loading} = useSelector((state) => state.auth);
  
  // Initialize session time when app loads if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(updateSessionTime());
    }
  }, [dispatch, isAuthenticated]);
  
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            {/* <Route path="/testManageOrg" element={<NewOrgManagement />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />

            {/* User routes - Removed ProtectedRoute wrapper */}
            <Route path="/user/*" element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="learning-hub" element={<LearningHub />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="activity-history" element={<ActivityHistory />} />
              <Route path="help-center" element={<HelpCenter />} />
              <Route path="assigned" element={<Assigned />} />
              <Route path="additional" element={<Additional />} />
              <Route path="mandatory" element={<Mandatory />} />
            </Route>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="users" element={<UsersManagement />} />
              <Route path="groups" element={<GroupsManagement />} />
              {/* <Route path="roles" element={<RolesManagement />} /> */}
              <Route path="content-modules" element={<ContentModules />} />
              <Route
                path="content-assessments"
                element={<ContentAssessments />}
              />
              <Route path="learning-paths" element={<LearningPaths />} />
              <Route path="manage-surveys" element={<Surveys />} />
              <Route path="create-assignment" element={<CreateAssignment />} />
              <Route path="manage-assignments" element={<ManageAssignment />} />
              <Route path="help-center" element={<AdminHelpCenter />} />
              <Route path="message-board" element={<AdminMessageBoard />} />
              <Route path="portal-library" element={<AdminPortalActivity />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="activity-log" element={<AdminActivityLog />} />
            </Route>

            {/* Global Admin routes - Removed ProtectedRoute wrapper */}
            <Route path="/global-admin/*" element={<GlobalAdminLayout />}>
              {/* <Route
                path="organizations"
                element={<OrganizationManagement />}
              /> */}
              <Route
                path="organizations"
                element={<NewOrgManagement />}
              />
              <Route path="message-board" element={<GlobalMessageBoard />} />
              <Route path="roles" element={<GlobalRolesManagement />} />
              <Route path="content" element={<GlobalContentManagement />} />
              <Route path="content/:contentId" element={<GlobalContentDetails />} />
              <Route path="surveys" element={<GlobalSurveys/>} />
              <Route path="assignments" element={<GlobalCreateAssignment />} />
              <Route path="user-dashboard-config" element={<UserDashBoardConfig />} />
              <Route path="admin-dashboard-config" element={<AdminDashBoardConfig />} />
              <Route path="profile" element={<GlobalProfile />} />
              <Route path="activity-log" element={<GlobalActivityLog />} />
              <Route path="help-center" element={<GlobalHelpCenter />} />
              <Route path="portal-library-admin" element={<GlobalPortalActivity/>} />
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all - 404 */}
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes> 
        </div>
      </Router>
    </Provider>
  );
}

export default App;
