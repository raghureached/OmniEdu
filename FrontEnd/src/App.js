
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import './App.css';
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
import Assigned from './pages/user/Assigned/Assigned';
import Additional from './pages/user/Additional/Additional';
import Mandatory from './pages/user/Mandatory/Mandatory';

// Admin Pages 
import AdminHome from './pages/admin/AdminHome/AdminHome';
import UsersManagement from './pages/admin/UsersManagement/UsersManagement';
import GroupsManagement from './pages/admin/GroupsManagement/GroupsManagement';
import LearningPaths from './pages/admin/LearningPaths/LearningPaths';
import AdminProfile from './pages/admin/AdminProfile/AdminProfile';
import CreateAssignment from './pages/admin/CreateAssignment/CreateAssignment';
import ManageAssignment from './pages/admin/ManageAssignment/ManageAssignment';
import AdminHelpCenter from './pages/admin/AdminHelpCenter/AdminHelpCenter';
import AdminMessageBoard from './pages/admin/AdminMessageBoard/AdminMessageBoard';
import AdminActivityLog from './pages/admin/AdminActivityLog/AdminActivityLog';
import AdminPortalActivity from './pages/admin/AdminPortalActivity/AdminPortalActivity';
import AdminAssessments from './pages/admin/AdminAssessments/AdminAssessments';
import ModuleManagement from './pages/admin/ContentModules/ModuleManagement';
import AdminSurveys from './pages/admin/AdminSurveys/AdminSurvey';

// Global Admin Pages 
import OrganizationManagement from './pages/globalAdmin/OrganizationManagement/OrganizationManagement';
import GlobalRolesManagement from './pages/globalAdmin/GlobalRolesManagement/GlobalRolesManagement';
import GlobalPortalActivity from './pages/globalAdmin/GlobalAdminLibraryPortal/GlobalPortal';
import Dashboard from './pages/user/Dashboard/Dashboard';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, updateSessionTime } from './store/slices/authSlice';
import GlobalHelpCenter from './pages/globalAdmin/GlobalHelpCenter/GlobalHelpCenter';
import GlobalProfile from './pages/globalAdmin/GlobalProfile/GlobalProfile';
import GlobalModuleDetail from './pages/globalAdmin/GlobalModuleManagement/GlobalModuleDetail';
import GlobalMessageBoard from './pages/globalAdmin/GlobalMessageBoard/GlobalMessageBoard';
import LoadingScreen from './components/common/Loading/Loading';
import UserDashBoardConfig from './pages/globalAdmin/UserDashBoardConfig/UserDashBoardConfig';
import AdminDashBoardConfig from './pages/globalAdmin/AdminDashBoardConfig/AdminDashBoardConfig';
import GlobalCreateAssignment from './pages/globalAdmin/GlobalAssignments/CreateAssignment';
import GlobalAdminActivity from './pages/globalAdmin/GlobalActivityLog/GlobalActivityLog';
import AnalyticsView from './pages/globalAdmin/Analyticsview/AnalyticsView';
import GlobalAdminHome from './pages/globalAdmin/GlobalAdminDashboard/GlobalAdminHome';
import GlobalAssessments from './pages/globalAdmin/GlobalAssessments/GlobalAssessments';
import GlobalModuleManagement from './pages/globalAdmin/GlobalModuleManagement/GlobalModuleManagement';
import Globalusers from './pages/globalAdmin/Users/Globalusers';
import GlobalSurveys from './pages/globalAdmin/GlobalSurveys/GlobalAssessments-survey';
import LearningPath from './components/LearningPath/LearningPath';
import CreateAssignmentEnhanced from './pages/admin/CreateAssignment/CreateAssignmentEnhanced';
import ModuleView from './pages/user/ModuleView/ModuleView';
function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // useEffect(() => {
  //   dispatch(checkAuth());
  //   const interval = setInterval(() => {
  //     dispatch(updateSessionTime());
  //   }, 60000);
  //   return () => clearInterval(interval);
  // }, [dispatch]);
  const { isAuthenticated, role, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'user') {
        navigate('/user/dashboard');
      } else if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'global-admin') {
        navigate('/global-admin');
      }
    }
  }, [isAuthenticated, role, navigate]);
  if (loading) {
    return <LoadingScreen text={"Please Wait..."}/>
  }
  return (
    <div className="App">
      <Routes>
          <Route
            path="/login"
            element={
              <Login />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
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
            <Route path="content-modules" element={<ModuleManagement />} />
            <Route path="content-assessments" element={<AdminAssessments />} />
            <Route path="learning-paths" element={<LearningPaths />} />
            <Route path='learning-paths/preview' element={<LearningPath/>}/>

            <Route path="manage-surveys" element={<AdminSurveys />} />
            <Route path="create-assignment" element={<CreateAssignmentEnhanced />} />
            <Route path="manage-assignments" element={<ManageAssignment />} />
            <Route path="help-center" element={<AdminHelpCenter />} />
            <Route path="message-board" element={<AdminMessageBoard />} />
            <Route path="portal-library" element={<AdminPortalActivity />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="activity-log" element={<AdminActivityLog />} />
          </Route>
          <Route path="/global-admin/*" element={<GlobalAdminLayout />}>
            <Route index element={<GlobalAdminHome/>} />
            <Route path="organizations" element={<OrganizationManagement />} />
            <Route path="message-board" element={<GlobalMessageBoard />} />
            <Route path="roles" element={<GlobalRolesManagement />} />
            <Route path="module" element={<GlobalModuleManagement />} />
            <Route path="users" element={<Globalusers />} />
            <Route path="module/:moduleId" element={<GlobalModuleDetail />} />
            <Route path="assessments" element={<GlobalAssessments />} />
            <Route path="surveys" element={<GlobalSurveys />} />
            <Route path="assignments" element={<GlobalCreateAssignment />} />
            <Route path="user-dashboard-config" element={<UserDashBoardConfig />} />
            <Route path="admin-dashboard-config" element={<AdminDashBoardConfig />} />
            <Route path="profile" element={<GlobalProfile />} />
            <Route path="activity-log" element={<GlobalAdminActivity />} />
            <Route path="help-center" element={<GlobalHelpCenter />} />
            <Route path="portal-library-admin" element={<GlobalPortalActivity />} />    
            <Route path="analytics-view" element={<AnalyticsView />} />
            
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div>Page Not Found</div>} />
          <Route path='test' element={<LearningPath/>}/>
          <Route path="module/:moduleId" element={<ModuleView />} />

        </Routes>
      </div>
  );
}

export default App;
