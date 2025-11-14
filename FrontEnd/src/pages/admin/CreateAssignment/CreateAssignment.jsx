import React, { useEffect, useState } from 'react';
import './CreateAssignment.css';
import AddOrgDateRangePickerSingle from '../../../components/common/CustomDatePicker/DateRangePicker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent } from '../../../store/slices/contentSlice';
import { createGlobalAssignment } from '../../../store/slices/globalAssignmentSlice';
import { fetchGlobalAssessments } from '../../../store/slices/adminAssessmentSlice';
import { fetchOrganizations } from '../../../store/slices/organizationSlice';
import { fetchSurveys } from '../../../store/slices/adminSurveySlice';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import LoadingScreen from '../../../components/common/Loading/Loading';
import { adminfetchContent } from '../../../store/slices/adminModuleSlice';
import { fetchUsers } from '../../../store/slices/userSlice';
import api from '../../../services/apiOld';
import { admincreateAssignment } from '../../../store/slices/adminAssignmnetSlice';
import { getLearningPaths } from '../../../store/slices/learningPathSlice';
const GlobalCreateAssignment = () => {
  const dispatch = useDispatch();
  const fetchGroups = async()=>{
    try {
      const response = await api.get('/api/admin/getGroups');
      // console.log(response.data.data)
      setGroups(response.data.data);
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    dispatch(adminfetchContent());
    dispatch(fetchGlobalAssessments());
    dispatch(fetchUsers());
    dispatch(fetchSurveys());
    dispatch(getLearningPaths());
    fetchGroups();
  }, [dispatch]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showAssignDatePicker, setShowAssignDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [contentType, setContentType] = useState('');
  
  const { surveys } = useSelector(state => state.surveys);
  const { items } = useSelector(state => state.adminModule);
  const { assessments } = useSelector(state => state.globalAssessments);
  const {learningPaths} = useSelector((state) => state.learningPaths)
  
  const { users,loading } = useSelector(state => state.users);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groups,setGroups] = useState([])
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filters and derived content lists
  // console.log(users)
  const [contentSearchTerm, setContentSearchTerm] = useState('');
  let allContentItems;
  if (contentType === 'Module') {
    allContentItems = items;
  } else if (contentType === 'Assessment') {
    allContentItems = assessments;
  } else if (contentType === 'Survey') {
    allContentItems = surveys;
  } else if (contentType === 'Learning Path') {
    allContentItems = learningPaths;
  } else {
    allContentItems = [...items, ...assessments, ...surveys, ...learningPaths];
  }
  const filteredContentItems = allContentItems.filter(item =>
    item.title.toLowerCase().includes(contentSearchTerm.toLowerCase())
  );
  const stepTitles = [
    'Choose Target Audience',
    'Choose Content',
    'Dates & Configuration'
  ];
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  const filteredGroups = groups.filter(g =>
    (g.name || '').toLowerCase().includes(groupSearchTerm.toLowerCase())
  );
  const handleUserSelection = (userUuid) => {
    setFormData(prev => {
      const exists = prev.users.includes(userUuid);
      const nextUsers = exists
        ? prev.users.filter(id => id !== userUuid)
        : [...prev.users, userUuid];
      return { ...prev, users: nextUsers };
    });
  };
  const handleFilterChange = (e) => {
    setContentType(e.target.value);
    setContentSearchTerm('');
  };
  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const [formData, setFormData] = useState({
    contentType: '',
    contentId: '',
    contentName: '',
    assignDate: '',
    assignTime: '',
    dueDate: '',
    dueTime: '',
    notifyUsers: false,
    isRecurring: false,
    users: [],
    groups: [],
    assignType: 'individual',
    selectedUsers: [],
    selectedGroup: '',
    selectedGroups: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const handleGroupToggle = (groupId) => {
    setFormData(prev => {
      const exists = prev.selectedGroups.includes(groupId);
      const next = exists ? prev.selectedGroups.filter(id => id !== groupId) : [...prev.selectedGroups, groupId];
      return { ...prev, selectedGroups: next };
    });
  };
  const getDuration = (item) => {
    const contentItem = allContentItems.find((contentItem) => contentItem._id === item)
    if (contentItem.duration) {
      return contentItem.duration + " minutes"
    }
    return ""
  }
  const handleContentSelection = (item) => {
    setFormData({
      ...formData,
      contentId: item._id,
      contentName: item.title,
      contentType: assessments.includes(item)
        ? 'Assessment'
        : surveys.includes(item)
          ? 'Survey'
          : 'Module'
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    payload.assignedUsers = formData.users;
    payload.groups = formData.selectedGroups;
    try {
      await dispatch(admincreateAssignment(payload)).unwrap();
    } catch (err) {
      console.error('Create assignment or publish failed', err);
    }
    setFormData({
      contentType: '',
      contentId: '',
      contentName: '',
      assignDate: '',
      assignTime: '',
      dueDate: '',
      dueTime: '',
      notifyUsers: false,
      isRecurring: false,
      users: [],
      groups: []
    });
    setCurrentStep(1);
  };
  if (loading) {
    return <LoadingScreen text="Fetching Users..." />
  }
  return (
    <div className="global-assign-create-assignment-container">
      <div className="global-assign-assignment-form-container">
        <div className="global-assign-assignment-steps">
          {stepTitles.map((title, index) => {
            const step = index + 1;
            return (
              <div
                key={step}
                className={[
                  'global-assign-assignment-step',
                  currentStep === step ? 'global-assign-active' : '',
                  currentStep > step ? 'global-assign-completed' : ''
                ].filter(Boolean).join(' ')}
              >
                <div className="global-assign-step-number">{step}</div>
                <div className="global-assign-step-label">{title}</div>
              </div>
            );
          })}
        </div>
        <form onSubmit={handleSubmit} className="global-assign-assignment-form">
          {currentStep === 1 && (
            <div className="global-assign-assignment-step-content">
              <h2 className="global-assign-step-title">Step 1: Choose Target Audience</h2>

              <div className="global-assign-audience-type-selection">
                <label className="global-assign-audience-type-option">
                  <input
                    type="radio"
                    id="individual"
                    name="assignType"
                    value="individual"
                    checked={formData.assignType === 'individual'}
                    onChange={handleInputChange}
                  />
                  Assign to Individual Users
                </label>

                <label className="global-assign-audience-type-option">
                  <input
                    type="radio"
                    id="group"
                    name="assignType"
                    value="group"
                    checked={formData.assignType === 'group'}
                    onChange={handleInputChange}
                  />
                  Assign to a Team
                </label>
              </div>
              {formData.assignType === 'individual' ? (
                <div className="global-assign-user-selection">
                  <label>Select Users (by Email):</label>
                  <input
                    type="text"
                    placeholder="Search users by email"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="global-assign-user-search-input"
                  />
                  <div className="global-assign-users-list">
                    {filteredUsers.map(user => (
                      <div
                        key={user.uuid}
                        className={[
                          'global-assign-user-item',
                          formData.users.includes(user._id) ? 'global-assign-selected' : ''
                        ].filter(Boolean).join(' ')}
                        onClick={() => handleUserSelection(user._id)}
                      >
                        <div className="global-assign-user-email">{user.email}</div>
                        <div className="global-assign-user-name">{user.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="global-assign-group-selection">
                  <label>Select Team (by name):</label>
                  <input
                    type="text"
                    placeholder="Search teams by name"
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    className="global-assign-user-search-input"
                  />
                  <div className="global-assign-users-list">
                    {filteredGroups.map(group => (
                      <div
                        key={group._id}
                        className={[
                          'global-assign-user-item',
                          formData.selectedGroups.includes(group._id) ? 'global-assign-selected' : ''
                        ].filter(Boolean).join(' ')}
                        onClick={() => handleGroupToggle(group._id)}
                      >
                        <div className="global-assign-user-email">{group.name}</div>
                      </div>
                    ))}
                    {filteredGroups.length === 0 && (
                      <div className="global-assign-no-content-found">No groups found.</div>
                    )}
                  </div>
                </div>
              )}
              <div className="global-assign-step-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className='btn-secondary' disabled={currentStep === 1}>
                  <ChevronLeft size={20} /> Previous
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={
                    (formData.assignType === 'individual' && formData.users.length === 0) ||
                    (formData.assignType === 'group' && formData.selectedGroups.length === 0)
                  }
                >
                  Next <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="global-assign-assignment-step-content" style={{ height: 'fit-content' }}>
              <h2 className="global-assign-step-title">Step 2: Choose Content to Assign</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search Modules, Assessments, Learning Paths, Surveys by name..."
                  value={contentSearchTerm}
                  onChange={(e) => setContentSearchTerm(e.target.value)}
                  className="global-assign-content-search-input"
                />
                <select
                  value={contentType}
                  onChange={handleFilterChange}
                  name="contentType"
                  className="global-assign-type-select"
                  style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '8px 12px', borderRadius: '10px', backgroundColor: '#f5f5f5', width: '160px' }}
                >
                  <option value="">All Types</option>
                  <option value="Module">Module</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Survey">Survey</option>
                  <option value="Learning Path">Learning Path</option>
                </select>
              </div>
              <div className="global-assign-content-items-list">
                {filteredContentItems.length > 0 ? (
                  filteredContentItems.slice(0, 8).map(item => (
                    <div
                      key={item.uuid}
                      className={[
                        'global-assign-content-item',
                        formData.contentId === item._id ? 'global-assign-selected' : ''
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleContentSelection(item)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
                        <div>
                          <div className="global-assign-content-item-type">
                            {assessments.includes(item)
                              ? 'Assessment'
                              : surveys.includes(item)
                                ? 'Survey'
                                : items.includes(item)
                                  ? 'Module'
                                  : 'Learning Path'}
                          </div>
                          <div className="global-assign-content-item-name">{item.title.toUpperCase()}</div>
                        </div>
                        <div>
                          {/* <button className="btn-secondary">Preview</button> */}
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="global-assign-no-content-found">
                    No content items found matching your search.
                  </div>
                )}
              </div>
              <div className="global-assign-step-actions" style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                  <ChevronLeft size={20} />Previous
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
                    Cancel
                  </button>
                  <button type="button" className="btn-primary" onClick={handleNextStep} disabled={!formData.contentId}>
                    Next <ChevronRight size={20} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="global-assign-assignment-step-content">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="global-assign-step-title">Step 3: Dates & Configuration</h2>
                {getDuration(formData.contentId) && <p style={{ color: "#666", fontSize: "14px", fontWeight: "bold" }}>Selected content duration: {getDuration(formData.contentId) ? getDuration(formData.contentId) : ""}</p>}
              </div>
              <div className="global-assign-dates-container" style={{ marginTop: "20px" }}>
                <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                  <div className="global-assign-date-field">
                    <label>Assign On:</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.assignDate ? new Date(formData.assignDate).toLocaleDateString() : ''}
                      onClick={() => setShowAssignDatePicker(true)}
                      placeholder="Select Assign Date"
                      className="global-assign-date-input"
                    />
                    {showAssignDatePicker && (
                      <AddOrgDateRangePickerSingle
                        title="Select Assign Date"
                        selectedDate={formData.assignDate ? new Date(formData.assignDate) : null}
                        onDateChange={(date) =>
                          setFormData({ ...formData, assignDate: date.toISOString().split('T')[0] })
                        }
                        onClose={() => setShowAssignDatePicker(false)}
                      />
                    )}
                  </div>

                  <div className="global-assign-date-field">
                    <label>Assign Time:</label>
                    <input
                      type="time"
                      name="assignTime"
                      value={formData.assignTime}
                      onChange={handleInputChange}
                      required
                      className="global-assign-time-input"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                  <div className="global-assign-date-field">
                    <label>Due Date:</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : ''}
                      onClick={() => setShowDueDatePicker(true)}
                      placeholder="Select Due Date"
                      className="global-assign-date-input"
                    />
                    {showDueDatePicker && (
                      <AddOrgDateRangePickerSingle
                        title="Select Due Date"
                        isEndDate
                        minDate={formData.assignDate ? new Date(formData.assignDate) : null}
                        startDate={formData.assignDate ? new Date(formData.assignDate) : null}
                        selectedDate={formData.dueDate ? new Date(formData.dueDate) : null}
                        onDateChange={(date) =>
                          setFormData({ ...formData, dueDate: date.toISOString().split('T')[0] })
                        }
                        onClose={() => setShowDueDatePicker(false)}
                      />
                    )}
                  </div>

                  <div className="global-assign-date-field">
                    <label>Due Time:</label>
                    <input
                      type="time"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={handleInputChange}
                      required
                      className="global-assign-time-input"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexDirection: "column" }}>
                <div className="global-assign-notification-option" style={{ alignSelf: "flex-start" }}>
                  <input
                    type="checkbox"
                    id="notifyUsers"
                    name="notifyUsers"
                    checked={formData.notifyUsers}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="notifyUsers">Send email notification to users</label>
                </div>
                <div className="global-assign-recurring-option" style={{ alignSelf: "flex-start" }}>
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    disabled
                  />
                  <label htmlFor="isRecurring">Make this a recurring assignment</label>
                  <p className="global-assign-recurring-note">(Coming soon)</p>
                </div>
              </div>

              <div className="global-assign-step-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: '110px' }}>
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>
                  <ChevronLeft size={20} />Previous
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
                    Cancel
                  </button>
                  <button type="button" className="btn-primary" onClick={handleSubmit}>
                    Create Assignment
                  </button>
                </div>

              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

export default GlobalCreateAssignment;




