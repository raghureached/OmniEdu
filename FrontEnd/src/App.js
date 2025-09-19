// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { checkAuth, updateSessionTime } from './store/slices/authSlice';
// import LoadingScreen from './components/common/Loading/Loading';

// // Redux provider
// import { Provider } from 'react-redux';
// import store from './store';

// // Auth pages
// import Login from './pages/auth/Login/Login';
// import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
// import EmailConfirmation from './pages/auth/EmailConfirmation/EmailConfirmation';

// // Layouts
// import UserLayout from './components/layouts/UserLayout/UserLayout';
// import AdminLayout from './components/layouts/AdminLayout/AdminLayout';
// import GlobalAdminLayout from './components/layouts/GlobalAdminLayout/GlobalAdminLayout';

// // User Pages
// import Dashboard from './pages/user/Dashboard/Dashboard';
// import UserProfile from './pages/user/UserProfile/UserProfile';
// import LearningHub from './pages/user/LearningHub/LearningHub';
// import Catalog from './pages/user/Catalog/Catalog';
// import ActivityHistory from './pages/user/ActivityHistory/ActivityHistory';
// import HelpCenter from './pages/user/HelpCenter/HelpCenter';
// import Assigned from './pages/user/Assigned/Assigned';
// import Additional from './pages/user/Additional/Additional';
// import Mandatory from './pages/user/Mandatory/Mandatory';

// // Admin Pages
// import AdminHome from './pages/admin/AdminHome/AdminHome';
// import UsersManagement from './pages/admin/UsersManagement/UsersManagement';
// import GroupsManagement from './pages/admin/GroupsManagement/GroupsManagement';
// import ContentModules from './pages/admin/ContentModules/ContentModules';
// import ContentAssessments from './pages/admin/ContentAssessments/ContentAssessments';
// import LearningPaths from './pages/admin/LearningPaths/LearningPaths';
// import Surveys from './pages/admin/Surveys/Surveys';
// import AdminProfile from './pages/admin/AdminProfile/AdminProfile';
// import CreateAssignment from './pages/admin/CreateAssignment/CreateAssignment';
// import ManageAssignment from './pages/admin/ManageAssignment/ManageAssignment';
// import AdminHelpCenter from './pages/admin/AdminHelpCenter/AdminHelpCenter';
// import AdminMessageBoard from './pages/admin/AdminMessageBoard/AdminMessageBoard';
// import AdminActivityLog from './pages/admin/AdminActivityLog/AdminActivityLog';
// import AdminPortalActivity from './pages/admin/AdminPortalActivity/AdminPortalActivity';

// // Global Admin Pages
// import OrganizationManagement from './pages/globalAdmin/OrganizationManagement/OrganizationManagement';
// import GlobalRolesManagement from './pages/globalAdmin/GlobalRolesManagement/GlobalRolesManagement';
// import GlobalContentManagement from './pages/globalAdmin/GlobalContentManagement/GlobalContentManagement';
// import GlobalSurveys from './pages/globalAdmin/GlobalSurveys/GlobalSurveys';
// import GlobalPortalActivity from './pages/globalAdmin/GlobalAdminLibraryPortal/GlobalPortal';
// import GlobalActivityLog from './pages/globalAdmin/GlobalActivityLog/GlobalActivityLog';
// import GlobalHelpCenter from './pages/globalAdmin/GlobalHelpCenter/GlobalHelpCenter';
// import GlobalProfile from './pages/globalAdmin/GlobalProfile/GlobalProfile';
// import GlobalContentDetails from './pages/globalAdmin/GlobalContentManagement/GlobalContentDetail';
// import GlobalMessageBoard from './pages/globalAdmin/GlobalMessageBoard/GlobalMessageBoard';
// import UserDashBoardConfig from './pages/globalAdmin/UserDashBoardConfig/UserDashBoardConfig';
// import AdminDashBoardConfig from './pages/globalAdmin/AdminDashBoardConfig/AdminDashBoardConfig';
// import GlobalCreateAssignment from './pages/globalAdmin/GlobalAssignments/CreateAssignment';
// import GlobalAdminDashboard from './pages/globalAdmin/GlobalAdminDashboard/GlobalAdminDashboard';

// // Styles
// import './App.css';


// // 🔒 ProtectedRoute component
// const ProtectedRoute = ({ children, role: requiredRole }) => {
//   const { isAuthenticated, role } = useSelector((state) => state.auth);
  
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requiredRole && role !== requiredRole) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };


// function App() {
//   const dispatch = useDispatch();
//   const { isAuthenticated, role, loading } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if(!isAuthenticated){
//       dispatch(checkAuth());
//     }
//   }, [dispatch,isAuthenticated])

//   if (loading) {
//     return <LoadingScreen text={"Please wait..."}/>;
//   }

//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route
//             path="/login"
//             element={~
//               isAuthenticated && role ? (
//                 role === "GlobalAdmin" ? (
//                   <Navigate to="/global-admin" replace />
//                 ) : role === "Admin" ? (
//                   <Navigate to="/admin" replace />
//                 ) : (
//                   <Navigate to="/user" replace />
//                 )
//               ) : (
//                 <Login />
//               )
//             }
//           />

//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/email-confirmation" element={<EmailConfirmation />} />

//           {/* 👤 User Routes */}
//           <Route
//             path="/user/*"
//             element={
//               <ProtectedRoute role="User">
//                 <UserLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route index element={<Navigate to="dashboard" replace />} />
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="profile" element={<UserProfile />} />
//             <Route path="learning-hub" element={<LearningHub />} />
//             <Route path="catalog" element={<Catalog />} />
//             <Route path="activity-history" element={<ActivityHistory />} />
//             <Route path="help-center" element={<HelpCenter />} />
//             <Route path="assigned" element={<Assigned />} />
//             <Route path="additional" element={<Additional />} />
//             <Route path="mandatory" element={<Mandatory />} />
//           </Route>

//           {/* 🛠 Admin Routes */}
//           <Route
//             path="/admin/*"
//             element={
//               <ProtectedRoute role="Admin">
//                 <AdminLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route index element={<AdminHome />} />
//             <Route path="users" element={<UsersManagement />} />
//             <Route path="groups" element={<GroupsManagement />} />
//             <Route path="content-modules" element={<ContentModules />} />
//             <Route path="content-assessments" element={<ContentAssessments />} />
//             <Route path="learning-paths" element={<LearningPaths />} />
//             <Route path="manage-surveys" element={<Surveys />} />
//             <Route path="create-assignment" element={<CreateAssignment />} />
//             <Route path="manage-assignments" element={<ManageAssignment />} />
//             <Route path="help-center" element={<AdminHelpCenter />} />
//             <Route path="message-board" element={<AdminMessageBoard />} />
//             <Route path="portal-library" element={<AdminPortalActivity />} />
//             <Route path="profile" element={<AdminProfile />} />
//             <Route path="activity-log" element={<AdminActivityLog />} />
//           </Route>

//           {/* 🌍 Global Admin Routes */}
//           <Route
//             path="/global-admin/*"
//             element={
//               <ProtectedRoute role="GlobalAdmin">
//                 <GlobalAdminLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route index element={<GlobalAdminDashboard />} />
//             <Route path="organizations" element={<OrganizationManagement />} />
//             <Route path="message-board" element={<GlobalMessageBoard />} />
//             <Route path="roles" element={<GlobalRolesManagement />} />
//             <Route path="content" element={<GlobalContentManagement />} />
//             <Route path="content/:contentId" element={<GlobalContentDetails />} />
//             <Route path="surveys" element={<GlobalSurveys />} />
//             <Route path="assignments" element={<GlobalCreateAssignment />} />
//             <Route path="user-dashboard-config" element={<UserDashBoardConfig />} />
//             <Route path="admin-dashboard-config" element={<AdminDashBoardConfig />} />
//             <Route path="profile" element={<GlobalProfile />} />
//             <Route path="activity-log" element={<GlobalActivityLog />} />
//             <Route path="help-center" element={<GlobalHelpCenter />} />
//             <Route path="portal-library-admin" element={<GlobalPortalActivity />} />
//           </Route>

//           {/* Redirect root → login */}
//           <Route path="/" element={<Navigate to="/login" replace />} />

//           {/* 404 */}
//           <Route path="*" element={<div>Page Not Found</div>} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;



import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
// import NewOrgManagement from './pages/globalAdmin/OrganizationManagement/NewOrgManagement';
import GlobalRolesManagement from './pages/globalAdmin/GlobalRolesManagement/GlobalRolesManagement';
import GlobalContentManagement from './pages/globalAdmin/GlobalContentManagement/GlobalContentManagement';
import GlobalSurveys from './pages/globalAdmin/GlobalSurveys/GlobalSurveys';
import GlobalPortalActivity from './pages/globalAdmin/GlobalAdminLibraryPortal/GlobalPortal';
import Dashboard from './pages/user/Dashboard/Dashboard';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth, updateSessionTime } from './store/slices/authSlice';
import GlobalHelpCenter from './pages/globalAdmin/GlobalHelpCenter/GlobalHelpCenter';
import GlobalProfile from './pages/globalAdmin/GlobalProfile/GlobalProfile';
import GlobalContentDetails from './pages/globalAdmin/GlobalContentManagement/GlobalContentDetail';
import GlobalMessageBoard from './pages/globalAdmin/GlobalMessageBoard/GlobalMessageBoard';
import LoadingScreen from './components/common/Loading/Loading';
import UserDashBoardConfig from './pages/globalAdmin/UserDashBoardConfig/UserDashBoardConfig';
import AdminDashBoardConfig from './pages/globalAdmin/AdminDashBoardConfig/AdminDashBoardConfig';
import GlobalCreateAssignment from './pages/globalAdmin/GlobalAssignments/CreateAssignment';
import GlobalAdminActivity from './pages/globalAdmin/GlobalActivityLog/GlobalActivityLog';
import AnalyticsView from './pages/globalAdmin/Analyticsview/AnalyticsView';
import GlobalAdminDashboard from './pages/globalAdmin/GlobalAdminDashboard/GlobalAdminDashboard';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, role } = useSelector((state) => state.auth);

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, role, loading } = useSelector((state) => state.auth);
  useEffect(() => {
    if (!isAuthenticated && localStorage.getItem('token')) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(updateSessionTime());
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={
              loading ? (
                <LoadingScreen />
              ) : isAuthenticated && role ? (
                role === "GlobalAdmin" ? (
                  <Navigate to="/global-admin" replace />
                ) : role === "Admin" ? (
                  <Navigate to="/admin" replace />
                ) : role === "User" ? (
                  <Navigate to="/user/learning-hub" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/user/*" element={<ProtectedRoute allowedRoles={["User"]}>
            <UserLayout />
          </ProtectedRoute>}>
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
          <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>}>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="groups" element={<GroupsManagement />} />
            <Route path="content-modules" element={<ContentModules />} />
            <Route path="content-assessments" element={<ContentAssessments />} />
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

          {/* Global Admin routes */}
          <Route path="/global-admin/*" element={<ProtectedRoute allowedRoles={["GlobalAdmin"]}>
            <GlobalAdminLayout />
          </ProtectedRoute>}>
            <Route index element={<GlobalAdminDashboard />} />
            <Route path="organizations" element={<OrganizationManagement />} />
            <Route path="message-board" element={<GlobalMessageBoard />} />
            <Route path="roles" element={<GlobalRolesManagement />} />
            <Route path="content" element={<GlobalContentManagement />} />
            <Route path="content/:contentId" element={<GlobalContentDetails />} />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
