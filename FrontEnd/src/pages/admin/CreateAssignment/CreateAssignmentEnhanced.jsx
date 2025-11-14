import React, { useEffect, useState } from 'react';
import './CreateAssignment.css';
import './CreateAssignmentV2.css';
import { useDispatch, useSelector } from 'react-redux';
import { adminfetchContent } from '../../../store/slices/adminModuleSlice';
import { fetchGlobalAssessments } from '../../../store/slices/adminAssessmentSlice';
import { fetchSurveys } from '../../../store/slices/adminSurveySlice';
import { fetchUsers } from '../../../store/slices/userSlice';
import { getLearningPaths } from '../../../store/slices/learningPathSlice';
import { admincreateAssignment } from '../../../store/slices/adminAssignmnetSlice';
import api from '../../../services/apiOld';
import LoadingScreen from '../../../components/common/Loading/Loading';

// Import step components
import Step1ContentSelection from './components/Step1ContentSelection';
import Step2UserSelection from './components/Step2UserSelection';
import Step3ScheduleSettings from './components/Step3ScheduleSettings';
import Step4ReviewConfirm from './components/Step4ReviewConfirm';
import SummaryPanel from './components/SummaryPanel';

const CreateAssignmentEnhanced = () => {
  const dispatch = useDispatch();
  
  // Fetch data
  const fetchGroups = async () => {
    try {
      const response = await api.get('/api/admin/getGroups');
      setGroups(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(adminfetchContent());
    dispatch(fetchGlobalAssessments());
    dispatch(fetchUsers());
    dispatch(fetchSurveys());
    dispatch(getLearningPaths());
    fetchGroups();
  }, [dispatch]);

  // Redux state
  const { surveys } = useSelector(state => state.surveys);
  const { items } = useSelector(state => state.adminModule);
  const { assessments } = useSelector(state => state.globalAssessments);
  const { learningPaths } = useSelector(state => state.learningPaths);
  const { users, loading } = useSelector(state => state.users);

  // Component state
  const [currentStep, setCurrentStep] = useState(1);
  const [groups, setGroups] = useState([]);

  // Step 1: Content Selection
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterTeam, setFilterTeam] = useState('');
  const [filterSubTeam, setFilterSubTeam] = useState('');

  // Step 2: User Selection
  const [userMode, setUserMode] = useState('individual');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [bulkEmails, setBulkEmails] = useState('');

  // Step 3: Schedule & Settings
  const [assignDate, setAssignDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [enableReminder, setEnableReminder] = useState(false);
  const [resetProgress, setResetProgress] = useState(false);
  const [enableRecurring, setEnableRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState('');
  const [customIntervalValue, setCustomIntervalValue] = useState('');
  const [customIntervalUnit, setCustomIntervalUnit] = useState('days');
  const [elementSchedules, setElementSchedules] = useState([]);
  const [enforceOrder, setEnforceOrder] = useState(false);

  // Get content items based on selected type
  const getContentItems = () => {
    switch (selectedContentType) {
      case 'Module':
        return items || [];
      case 'Assessment':
        return assessments || [];
      case 'Survey':
        return surveys || [];
      case 'Learning Path':
        return learningPaths || [];
      default:
        return [];
    }
  };

  // Step navigation
  const goToStep = (step) => {
    if (validateStep(currentStep)) {
      setCurrentStep(step);
      window.scrollTo(0, 0);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!selectedContentType || !selectedItem) {
          alert('Please select a content type and an item to assign.');
          return false;
        }
        return true;
      case 2:
        if (userMode === 'individual' && selectedUsers.length === 0) {
          alert('Please select at least one user to assign content to.');
          return false;
        }
        if (userMode === 'group' && selectedGroups.length === 0) {
          alert('Please select at least one team.');
          return false;
        }
        if (userMode === 'bulk') {
          const emails = bulkEmails.trim();
          if (!emails) {
            alert('Please enter at least one email address.');
            return false;
          }
          const emailList = emails.split('\n').filter(e => e.trim());
          if (emailList.length === 0) {
            alert('Please enter at least one valid email address.');
            return false;
          }
          if (emailList.length > 50) {
            alert('Maximum 50 email addresses allowed. Please reduce the number of emails.');
            return false;
          }
        }
        return true;
      case 3:
        if (assignDate && dueDate) {
          const assign = new Date(assignDate);
          const due = new Date(dueDate);
          if (due <= assign) {
            alert('Due date must be after the assign date.');
            return false;
          }
        }
        if (enableRecurring) {
          const interval = recurringInterval;
          if (!interval) {
            alert('Please select a recurrence interval.');
            return false;
          }
          if (interval === 'custom') {
            const customValue = customIntervalValue;
            if (!customValue || customValue < 1) {
              alert('Please enter a valid custom interval value.');
              return false;
            }
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleSaveDraft = () => {
    alert('💾 Assignment saved as draft!\n\nYou can continue editing or publish it later.');
  };

  const handleConfirm = async () => {
    try {
      // Normalize element schedules: keep only entries with at least one date, and convert to ISO
      const normalizedElementSchedules = Array.isArray(elementSchedules)
        ? elementSchedules
            .filter(s => (s.assign_on && s.assign_on.trim()) || (s.due_date && s.due_date.trim()))
            .map(s => ({
              elementId: s.elementId,
              assign_on: s.assign_on ? new Date(s.assign_on).toISOString() : '',
              due_date: s.due_date ? new Date(s.due_date).toISOString() : ''
            }))
        : [];
      const payload = {
        contentType: selectedContentType,
        contentId: selectedItem._id,
        contentName: selectedItem.title,
        assignDate: assignDate || new Date().toISOString(),
        dueDate: dueDate || '',
        notifyUsers: sendEmail,
        isRecurring: enableRecurring,
        assignedUsers: userMode === 'individual' ? selectedUsers.map(u => u._id) : [],
        groups: userMode === 'group' ? selectedGroups : [],
        bulkEmails: userMode === 'bulk' ? bulkEmails.split('\n').filter(e => e.trim()) : [],
        enableReminder,
        resetProgress,
        recurringInterval: enableRecurring ? recurringInterval : '',
        customIntervalValue: recurringInterval === 'custom' ? customIntervalValue : '',
        customIntervalUnit: recurringInterval === 'custom' ? customIntervalUnit : '',
        elementSchedules: selectedContentType === 'Learning Path' ? normalizedElementSchedules : [],
        enforceOrder: selectedContentType === 'Learning Path' ? enforceOrder : false
      };
      // console.log(payload)
      await dispatch(admincreateAssignment(payload)).unwrap();
      
      alert('✓ Assignment created successfully!\n\nUsers will be notified according to your settings.');
      
      // Reset form
      resetForm();
    } catch (err) {
      console.error('Create assignment failed', err);
      alert('Failed to create assignment. Please try again.');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedContentType('');
    setSelectedItem(null);
    setFilterTeam('');
    setFilterSubTeam('');
    setUserMode('individual');
    setSelectedUsers([]);
    setSelectedGroups([]);
    setBulkEmails('');
    setAssignDate('');
    setDueDate('');
    setSendEmail(false);
    setEnableReminder(false);
    setResetProgress(false);
    setEnableRecurring(false);
    setRecurringInterval('');
    setCustomIntervalValue('');
    setCustomIntervalUnit('days');
    setElementSchedules([]);
    setEnforceOrder(false);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <LoadingScreen text="Fetching Users..." />;
  }

  return (
    <div className="cae-scope container">
      {/* Page Header */}
      <div className="page-header">
        <h1>Assignment Manager</h1>
        <p>Assign learning content to users with customizable schedules and reminders</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Select Content</div>
        </div>
        <div className={`step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Select Users</div>
        </div>
        <div className={`step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Schedule & Settings</div>
        </div>
        <div className={`step ${currentStep === 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
          <div className="step-number">4</div>
          <div className="step-label">Review & Assign</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Column: Assignment Steps */}
        <div>
          {currentStep === 1 && (
            <Step1ContentSelection
              selectedContentType={selectedContentType}
              setSelectedContentType={setSelectedContentType}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              filterTeam={filterTeam}
              setFilterTeam={setFilterTeam}
              filterSubTeam={filterSubTeam}
              setFilterSubTeam={setFilterSubTeam}
              contentItems={getContentItems()}
              onNext={() => goToStep(2)}
              teams={groups}
            />
          )}

          {currentStep === 2 && (
            <Step2UserSelection
              userMode={userMode}
              setUserMode={setUserMode}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              bulkEmails={bulkEmails}
              setBulkEmails={setBulkEmails}
              users={users}
              groups={groups}
              selectedGroups={selectedGroups}
              setSelectedGroups={setSelectedGroups}
              onNext={() => goToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}

          {currentStep === 3 && (
            <Step3ScheduleSettings
              assignDate={assignDate}
              setAssignDate={setAssignDate}
              dueDate={dueDate}
              setDueDate={setDueDate}
              sendEmail={sendEmail}
              setSendEmail={setSendEmail}
              enableReminder={enableReminder}
              setEnableReminder={setEnableReminder}
              resetProgress={resetProgress}
              setResetProgress={setResetProgress}
              enableRecurring={enableRecurring}
              setEnableRecurring={setEnableRecurring}
              recurringInterval={recurringInterval}
              setRecurringInterval={setRecurringInterval}
              customIntervalValue={customIntervalValue}
              setCustomIntervalValue={setCustomIntervalValue}
              customIntervalUnit={customIntervalUnit}
              setCustomIntervalUnit={setCustomIntervalUnit}
              selectedContentType={selectedContentType}
              selectedItem={selectedItem}
              selectedUsers={selectedUsers}
              elementSchedules={elementSchedules}
              setElementSchedules={setElementSchedules}
              enforceOrder={enforceOrder}
              setEnforceOrder={setEnforceOrder}
              onNext={() => goToStep(4)}
              onBack={() => goToStep(2)}
            />
          )}

          {currentStep === 4 && (
            <Step4ReviewConfirm
              selectedItem={selectedItem}
              selectedContentType={selectedContentType}
              userMode={userMode}
              selectedUsers={selectedUsers}
              selectedGroups={selectedGroups}
              bulkEmails={bulkEmails}
              assignDate={assignDate}
              dueDate={dueDate}
              sendEmail={sendEmail}
              enableReminder={enableReminder}
              resetProgress={resetProgress}
              enableRecurring={enableRecurring}
              recurringInterval={recurringInterval}
              customIntervalValue={customIntervalValue}
              customIntervalUnit={customIntervalUnit}
              onBack={() => goToStep(3)}
              onSaveDraft={handleSaveDraft}
              onConfirm={handleConfirm}
            />
          )}
        </div>

        {/* Right Column: Summary Panel */}
        <SummaryPanel
          selectedContentType={selectedContentType}
          selectedItem={selectedItem}
          userMode={userMode}
          selectedUsers={selectedUsers}
          selectedGroups={selectedGroups}
          bulkEmails={bulkEmails}
          assignDate={assignDate}
          dueDate={dueDate}
          sendEmail={sendEmail}
          enableReminder={enableReminder}
          enableRecurring={enableRecurring}
          recurringInterval={recurringInterval}
          customIntervalValue={customIntervalValue}
          customIntervalUnit={customIntervalUnit}
        />
      </div>
    </div>
  );
};

export default CreateAssignmentEnhanced;
