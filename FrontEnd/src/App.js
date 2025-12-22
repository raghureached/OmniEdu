
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

import Mandatory from './pages/user/Mandatory/Mandatory';

// Admin Pages 
import AdminHome from './pages/admin/AdminHome/AdminHome';
import UsersManagement from './pages/admin/UsersManagement/UsersManagement';
import GroupsManagement from './pages/admin/GroupsManagement/GroupsManagement';
import LearningPaths from './pages/admin/LearningPaths/LearningPaths';
import AdminProfile from './pages/admin/AdminProfile/AdminProfile';
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
// import GlobalPortalActivity from './pages/globalAdmin/GlobalAdminLibraryPortal/GlobalPortal';
import Dashboard from './pages/user/Dashboard/Dashboard';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GlobalHelpCenter from './pages/globalAdmin/GlobalHelpCenter/GlobalHelpCenter';
import GlobalProfile from './pages/globalAdmin/GlobalProfile/GlobalProfile';
import GlobalModuleDetail from './pages/globalAdmin/GlobalModuleManagement/GlobalModuleDetail';
import GlobalMessageBoard from './pages/globalAdmin/GlobalMessageBoard/GlobalMessageBoard';
import LoadingScreen from './components/common/Loading/Loading';
import UserDashBoardConfig from './pages/globalAdmin/UserDashBoardConfig/UserDashBoardConfig';
import AdminDashBoardConfig from './pages/globalAdmin/AdminDashBoardConfig/AdminDashBoardConfig';
import GlobalCreateAssignment from './pages/globalAdmin/GlobalAssignments/CreateAssignment';
import GlobalAdminActivity from './pages/globalAdmin/GlobalActivityLog/GlobalActivityLog';
// import AnalyticsView from './pages/globalAdmin/Analyticsview/AnalyticsView';
import GlobalAdminHome from './pages/globalAdmin/GlobalAdminDashboard/GlobalAdminHome';
import GlobalAssessments from './pages/globalAdmin/GlobalAssessments/GlobalAssessments';
import GlobalModuleManagement from './pages/globalAdmin/GlobalModuleManagement/GlobalModuleManagement';
import Globalusers from './pages/globalAdmin/Users/Globalusers';
import GlobalSurveys from './pages/globalAdmin/GlobalSurveys/GlobalAssessments-survey';
import LearningPath from './components/LearningPath/LearningPath';
import CreateAssignmentEnhanced from './pages/admin/CreateAssignment/CreateAssignmentEnhanced';
import ModuleView from './pages/user/ModuleView/ModuleView';
import AssessmentView from './pages/user/AssessmentView/AssessmentView';
import LearningPathView from './pages/user/LearningPathView/LearningPathView';
import SurveyView from './pages/user/SurveyView/SurveyView';
import NavbarOnly from './components/layouts/NavbarOnly/NavbarOnly';
import ChangePassword from './pages/auth/ChangePassword/ChangePassword';
import { checkAuth, updateSessionTime } from './store/slices/authSlice';
import InProgress from './pages/user/InProgress/InProgress';
import Assigned from './pages/user/Assigned/Assigned';
import Completed from './pages/user/Completed/Completed';
import AnalyticsViewNew from './pages/globalAdmin/Analyticsview/AnalyticsViewNew';
import LearnerAnalytics from './pages/user/Analytics/Analytics';
import useLearningTracker from './hooks/LearningActivity';
import AdminAnalyticsDashboard from './pages/admin/AdminAnalytics/AdminAnalytics';
import TicketsTable from './pages/admin/AdminSupport/TicketsTable';
import UserTicketsTable from './pages/user/Support/UserTicketsTable';
import GlobalTicketsTable from './pages/globalAdmin/Tickets/TicketsTable';
import GradeSubmission from './pages/globalAdmin/GradeSubmissions/GradeSubmission';
import { fetchPermissions } from './store/slices/RolePermissionSlice';
import NotAllowed from './pages/NotAllowed/NotAllowed';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    dispatch(checkAuth());
    const interval = setInterval(() => {
      dispatch(updateSessionTime());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);
  const { isAuthenticated, role, loading } = useSelector((state) => state.auth);
  const {permissions} = useSelector((state)=>state.rolePermissions)

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

  useEffect(() => {
    if(role !== 'GlobalAdmin')
    dispatch(fetchPermissions());
  }, [dispatch]);
  if (loading) {
    return <LoadingScreen text={"Please Wait..."} />
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
          <Route path="profile" element={permissions.includes("Profile Access") ? <UserProfile /> : <NotAllowed />} />
          <Route path='analytics' element={<LearnerAnalytics />} />
          <Route path="learning-hub" element={permissions.includes("Learning Hub") ? <LearningHub /> : <NotAllowed />} />
          <Route path="catalog" element={permissions.includes("Global Library") ? <Catalog /> : <NotAllowed />} />
          <Route path="activity-history" element={permissions.includes("Activity History Access") ?  <ActivityHistory /> : <NotAllowed />} />
          <Route path="help-center" element={permissions.includes("Help Center Access") ? <HelpCenter /> : <NotAllowed />} />
          <Route path="assigned" element={permissions.includes("Assigned Training") ? <Assigned  /> : <NotAllowed />} />
          <Route path="inProgress" element={<InProgress />} />
          <Route path="completed" element={<Completed />} />
          <Route path="mandatory" element={<Mandatory />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path='support' element={permissions.includes("Support Button Access") ? <UserTicketsTable /> : <NotAllowed />} />
        </Route>
        <Route path="/admin/*" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="groups" element={<GroupsManagement />} />
          <Route path="content-modules" element={<ModuleManagement />} />
          <Route path="content-assessments" element={<AdminAssessments />} />
          <Route path="learning-paths" element={<LearningPaths />} />
          <Route path='learning-paths/preview' element={<LearningPath />} />
          <Route path='analytics' element={<AdminAnalyticsDashboard />} />
          <Route path="manage-surveys" element={<AdminSurveys />} />
          <Route path="create-assignment" element={<CreateAssignmentEnhanced />} />
          <Route path="manage-assignments" element={<ManageAssignment />} />
          <Route path="help-center" element={permissions.includes("Help Center Access") ? <AdminHelpCenter /> : <NotAllowed />} />
          <Route path="message-board" element={<AdminMessageBoard />} />
          <Route path="portal-library" element={<AdminPortalActivity />} />
          <Route path="profile" element={permissions.includes("Profile Access") ? <AdminProfile /> : <NotAllowed />} />
          <Route path="activity-log" element={permissions.includes("Activity History Access") ? <AdminActivityLog /> : <NotAllowed />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path='support' element={permissions.includes("Support Button Access") ? <TicketsTable /> : <NotAllowed />}/>
        </Route>
        <Route path="/global-admin/*" element={<GlobalAdminLayout />}>
          <Route index element={<GlobalAdminHome />} />
          <Route path='dashboard' element={<GlobalAdminHome />} />
          <Route path="organizations" element={<OrganizationManagement />} />
          <Route path="organizations/:orgId" element={<OrganizationManagement />} />
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
          <Route path="analytics-view" element={<AnalyticsViewNew />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route path='support' element={<GlobalTicketsTable />} />
          <Route path='support/:role' element={<GlobalTicketsTable />} />
          <Route path='grade-submissions' element={<GradeSubmission />} />
        </Route>
        <Route element={<NavbarOnly />}>
          {/* ORG ASSIGNMENTS */}
          <Route path="/module/:moduleId/:assignId" element={<ModuleView />} />
          <Route path="/module/:moduleId/:assignId/:inProgress" element={<ModuleView />} />
          <Route path="assessment/:assessmentId/:assignId" element={<AssessmentView />} />
          <Route path="assessment/:assessmentId/:assignId/:inProgress" element={<AssessmentView />} />
          <Route path="survey/:surveyId/:assignId" element={<SurveyView />} />
          <Route path="survey/:surveyId/:assignId/:inProgress" element={<SurveyView />} />
          <Route path="learningPath/:learningPathId/:assignId" element={<LearningPathView />} />
          <Route path="learningPath/:learningPathId/:assignId/:inProgress" element={<LearningPathView />} />

          {/* GLOBAL ENROLLED CONTENT */}
          <Route path="/enrolled/module/:moduleId" element={<ModuleView />} />
          <Route path="/enrolled/module/:moduleId/:inProgress" element={<ModuleView />} />

          <Route path="enrolled/assessment/:assessmentId" element={<AssessmentView />} />
          {/* <Route path="enrolled/assessment/:assessmentId/:inProgress" element={<AssessmentView />} /> */}

          <Route path="enrolled/survey/:surveyId" element={<SurveyView />} />
          {/* <Route path="enrolled/assessment/:assessmentId/:assignId/:inProgress" element={<AssessmentView />} /> */}

          {/* if/when you support enrolled surveys via buttonStatusFunc: */}
          {/* <Route path="enrolled/survey/:surveyId" element={<SurveyView />} />
  <Route path="enrolled/survey/:surveyId/:inProgress" element={<SurveyView />} /> */}
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<div>Page Not Found</div>} />
        <Route path='test' element={<NotAllowed />} />
    


      </Routes>
    </div>
  );
}

export default App;
