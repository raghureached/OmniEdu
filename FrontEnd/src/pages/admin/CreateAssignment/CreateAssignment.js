import React, { useState } from 'react';
import './CreateAssignment.css';

const CreateAssignment = () => {
  // State for tracking current step
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for form data
  const [formData, setFormData] = useState({
    // Step 1: Content Selection
    contentType: '',
    contentId: '',
    contentName: '',
    // Step 2: Target Audience
    assignType: 'individual', // 'individual' or 'group'
    selectedUsers: [],
    selectedGroup: '',
    // Step 3: Dates
    assignDate: '',
    assignTime: '',
    dueDate: '',
    dueTime: '',
    // Step 5: Notification
    notifyUsers: false,
    // Step 6: Recurring
    isRecurring: false
  });
  
  // Dummy data for content items
  const dummyContent = {
    modules: [
      { id: 1, name: 'Introduction to HTML', type: 'Module' },
      { id: 2, name: 'Advanced CSS Techniques', type: 'Module' },
      { id: 3, name: 'JavaScript Fundamentals', type: 'Module' }
    ],
    assessments: [
      { id: 1, name: 'HTML Knowledge Check', type: 'Assessment' },
      { id: 2, name: 'CSS Skills Assessment', type: 'Assessment' },
      { id: 3, name: 'JavaScript Proficiency Test', type: 'Assessment' }
    ],
    learningPaths: [
      { id: 1, name: 'Web Development Basics', type: 'Learning Path' },
      { id: 2, name: 'Frontend Developer Path', type: 'Learning Path' }
    ],
    surveys: [
      { id: 1, name: 'Course Feedback Survey', type: 'Survey' },
      { id: 2, name: 'Learning Experience Survey', type: 'Survey' }
    ]
  };
  
  // Dummy data for users
  const dummyUsers = [
    { id: 1, email: 'john.doe@example.com', name: 'John Doe' },
    { id: 2, email: 'jane.smith@example.com', name: 'Jane Smith' },
    { id: 3, email: 'bob.johnson@example.com', name: 'Bob Johnson' },
    { id: 4, email: 'alice.williams@example.com', name: 'Alice Williams' }
  ];
  
  // Dummy data for groups
  const dummyGroups = [
    { id: 1, name: 'Marketing Team' },
    { id: 2, name: 'Development Team' },
    { id: 3, name: 'HR Department' },
    { id: 4, name: 'Sales Team' }
  ];
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle user selection
  const handleUserSelection = (userId) => {
    const isSelected = formData.selectedUsers.includes(userId);
    
    if (isSelected) {
      setFormData({
        ...formData,
        selectedUsers: formData.selectedUsers.filter(id => id !== userId)
      });
    } else {
      setFormData({
        ...formData,
        selectedUsers: [...formData.selectedUsers, userId]
      });
    }
  };
  
  // Handle content selection
  const handleContentSelection = (content) => {
    setFormData({
      ...formData,
      contentType: content.type,
      contentId: content.id,
      contentName: content.name
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically dispatch an action to create the assignment
    console.log('Assignment created:', formData);
    // Reset form and go back to step 1
    setFormData({
      contentType: '',
      contentId: '',
      contentName: '',
      assignType: 'individual',
      selectedUsers: [],
      selectedGroup: '',
      assignDate: '',
      assignTime: '',
      dueDate: '',
      dueTime: '',
      notifyUsers: false,
      isRecurring: false
    });
    setCurrentStep(1);
  };
  
  // Handle next step
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Filter content based on search term
  const [contentSearchTerm, setContentSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // Get all content items in a flat array
  const allContentItems = [
    ...dummyContent.modules,
    ...dummyContent.assessments,
    ...dummyContent.learningPaths,
    ...dummyContent.surveys
  ];
  
  // Filter content items based on search term
  const filteredContentItems = allContentItems.filter(item =>
    item.name.toLowerCase().includes(contentSearchTerm.toLowerCase())
  );
  
  // Filter users based on search term
  const filteredUsers = dummyUsers.filter(user =>
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  
  return (
    <div className="create-assignment-container">
      {/* <h1 className="create-assignment-title">Create Assignment</h1> */}
      
      <div className="assignment-form-container">
        <div className="assignment-steps">
          <div className={`assignment-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Choose Content</div>
          </div>
          <div className={`assignment-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Target Audience</div>
          </div>
          <div className={`assignment-step ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Set Dates</div>
          </div>
          <div className={`assignment-step ${currentStep === 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Notifications</div>
          </div>
          <div className={`assignment-step ${currentStep === 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}>
            <div className="step-number">5</div>
            <div className="step-label">Recurring</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="assignment-form">
          {/* Step 1: Choose Content */}
          {currentStep === 1 && (
            <div className="assignment-step-content">
              <h2 className="step-title">Step 1: Choose Content to Assign</h2>
              <div className="content-search">
                <input
                  type="text"
                  placeholder="Search Modules, Assessments, Learning Paths, Surveys by name..."
                  value={contentSearchTerm}
                  onChange={(e) => setContentSearchTerm(e.target.value)}
                  className="content-search-input"
                />
              </div>
              
              <div className="content-selection-note">
                Select one item to assign.
              </div>
              
              <div className="content-items-list">
                {filteredContentItems.length > 0 ? (
                  filteredContentItems.map(item => (
                    <div 
                      key={`${item.type}-${item.id}`}
                      className={`content-item ${formData.contentId === item.id && formData.contentType === item.type ? 'selected' : ''}`}
                      onClick={() => handleContentSelection(item)}
                    >
                      <div className="content-item-type">{item.type}</div>
                      <div className="content-item-name">{item.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="no-content-found">No content items found matching your search.</div>
                )}
              </div>
              
              <div className="step-actions">
                <button 
                  type="button" 
                  className="next-step-btn" 
                  onClick={handleNextStep}
                  disabled={!formData.contentId}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Choose Target Audience */}
          {currentStep === 2 && (
            <div className="assignment-step-content">
              <h2 className="step-title">Step 2: Choose Target Audience</h2>
              
              <div className="audience-type-selection">
                <div className="audience-type-option">
                  <input 
                    type="radio" 
                    id="individual" 
                    name="assignType" 
                    value="individual"
                    checked={formData.assignType === 'individual'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="individual">Assign to Individual Users</label>
                </div>
                
                <div className="audience-type-option">
                  <input 
                    type="radio" 
                    id="group" 
                    name="assignType" 
                    value="group"
                    checked={formData.assignType === 'group'}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="group">Assign to a Group</label>
                </div>
              </div>
              
              {formData.assignType === 'individual' ? (
                <div className="user-selection">
                  <label>Select Users (by Email):</label>
                  <input
                    type="text"
                    placeholder="Search users by email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="user-search-input"
                  />
                  
                  <div className="users-list">
                    {filteredUsers.map(user => (
                      <div 
                        key={user.id}
                        className={`user-item ${formData.selectedUsers.includes(user.id) ? 'selected' : ''}`}
                        onClick={() => handleUserSelection(user.id)}
                      >
                        <div className="user-email">{user.email}</div>
                        <div className="user-name">{user.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="group-selection">
                  <label htmlFor="selectedGroup">Select Group:</label>
                  <select
                    id="selectedGroup"
                    name="selectedGroup"
                    value={formData.selectedGroup}
                    onChange={handleInputChange}
                    className="group-select"
                  >
                    <option value="">Select a group...</option>
                    {dummyGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="step-actions">
                <button type="button" className="prev-step-btn" onClick={handlePrevStep}>
                  Previous
                </button>
                <button 
                  type="button" 
                  className="next-step-btn" 
                  onClick={handleNextStep}
                  disabled={
                    (formData.assignType === 'individual' && formData.selectedUsers.length === 0) ||
                    (formData.assignType === 'group' && !formData.selectedGroup)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Set Dates */}
          {currentStep === 3 && (
            <div className="assignment-step-content">
              <h2 className="step-title">Step 3: Set Overall Dates</h2>
              
              <div className="dates-container">
                <div className="date-field">
                  <label htmlFor="assignDate">Assign On:</label>
                  <div className="date-time-inputs">
                    <input
                      type="date"
                      id="assignDate"
                      name="assignDate"
                      value={formData.assignDate}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="time"
                      id="assignTime"
                      name="assignTime"
                      value={formData.assignTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="date-field">
                  <label htmlFor="dueDate">Due Date:</label>
                  <div className="date-time-inputs">
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                    />
                    <input
                      type="time"
                      id="dueTime"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="date-note">
                Assign On and Due Date/Time are mandatory.
              </div>
              
              <div className="step-actions">
                <button type="button" className="prev-step-btn" onClick={handlePrevStep}>
                  Previous
                </button>
                <button 
                  type="button" 
                  className="next-step-btn" 
                  onClick={handleNextStep}
                  disabled={!formData.assignDate || !formData.assignTime || !formData.dueDate || !formData.dueTime}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Notifications */}
          {currentStep === 4 && (
            <div className="assignment-step-content">
              <h2 className="step-title">Step 4: Notify Users?</h2>
              
              <div className="notification-option">
                <input
                  type="checkbox"
                  id="notifyUsers"
                  name="notifyUsers"
                  checked={formData.notifyUsers}
                  onChange={handleInputChange}
                />
                <label htmlFor="notifyUsers">Send email notification to users when assignment is created</label>
              </div>
              
              <div className="step-actions">
                <button type="button" className="prev-step-btn" onClick={handlePrevStep}>
                  Previous
                </button>
                <button type="button" className="next-step-btn" onClick={handleNextStep}>
                  Next
                </button>
              </div>
            </div>
          )}
          
          {/* Step 5: Recurring */}
          {currentStep === 5 && (
            <div className="assignment-step-content">
              <h2 className="step-title">Step 5: Recurring Assignment?</h2>
              
              <div className="recurring-option">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleInputChange}
                  disabled={true}
                />
                <label htmlFor="isRecurring">Make this a recurring assignment</label>
                <p className="recurring-note">(Functionality for recurring assignments is planned for later)</p>
              </div>
              
              <div className="step-actions">
                <button type="button" className="prev-step-btn" onClick={handlePrevStep}>
                  Previous
                </button>
                <button type="submit" className="create-btn">
                  Create Assignment
                </button>
              </div>
            </div>
          )}
        </form>
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => setCurrentStep(1)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignment;