import React, { useEffect, useState } from 'react';
import './CreateAssignment.css';
import AddOrgDateRangePickerSingle from '../OrganizationManagement/DateRangePicker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent } from '../../../store/slices/contentSlice';
import { createGlobalAssignment } from '../../../store/slices/globalAssignmentSlice';

const GlobalCreateAssignment = () => {
    const dispatch = useDispatch();
    useEffect(()=>{
        dispatch(fetchContent())
    },[dispatch])
    const [currentStep, setCurrentStep] = useState(1);
    const [showAssignDatePicker, setShowAssignDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);


    const [formData, setFormData] = useState({
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
        isRecurring: false,
    });
    const {items } = useSelector((state) => state.content);
    const content = items;
    // console.log(dummyContent)

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleContentSelection = (content) => {
        setFormData({
            ...formData,
            contentType: content.type,
            contentId: content.uuid,
            contentName: content.title
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Assignment created:', formData);
        setFormData({
            contentType: '',
            contentId: '',
            contentName: '',
            assignDate: '',
            assignTime: '',
            dueDate: '',
            dueTime: '',
            notifyUsers: false,
            isRecurring: false
        });
        dispatch(createGlobalAssignment(formData));
        setCurrentStep(1);
    };

    const handleNextStep = () => setCurrentStep(currentStep + 1);
    const handlePrevStep = () => setCurrentStep(currentStep - 1);

    const [contentSearchTerm, setContentSearchTerm] = useState('');

    const filteredContentItems = content.filter(item =>
        item.title.toLowerCase().includes(contentSearchTerm.toLowerCase())
    );

    return (
        <div className="global-assign-create-assignment-container">
            <div className="global-assign-assignment-form-container">
                <div className="global-assign-assignment-steps">
                    {[1, 2, 3, 4].map(step => (
                        <div
                            key={step}
                            className={[
                                'global-assign-assignment-step',
                                currentStep === step ? 'global-assign-active' : '',
                                currentStep > step ? 'global-assign-completed' : ''
                            ].filter(Boolean).join(' ')}
                        >
                            <div className="global-assign-step-number">{step}</div>
                            <div className="global-assign-step-label">
                                {['Choose Content', 'Set Dates', 'Notifications', 'Recurring'][step - 1]}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="global-assign-assignment-form">

                    {/* Step 1: Choose Content */}
                    {currentStep === 1 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 1: Choose Content to Assign</h2>
                            <div className="global-assign-content-search">
                                <input
                                    type="text"
                                    placeholder="Search Modules, Assessments, Learning Paths, Surveys by name..."
                                    value={contentSearchTerm}
                                    onChange={(e) => setContentSearchTerm(e.target.value)}
                                    className="global-assign-content-search-input"
                                />
                            </div>
                            <div className="global-assign-content-selection-note">Select one item to assign.</div>
                            <div className="global-assign-content-items-list">
                                {filteredContentItems.length > 0 ? (
                                    filteredContentItems.map(item => (
                                        <div
                                            key={`${item._id}`}
                                            className={[
                                                "global-assign-content-item",
                                                formData.contentId === item.uuid && formData.contentType === item.type ? "global-assign-selected" : ""
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleContentSelection(item)}
                                        >
                                            {/* <div className="global-assign-content-item-type">{item.type.toUpperCase()}</div> */}
                                            <div className="global-assign-content-item-name">{item.title.toUpperCase()}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="global-assign-no-content-found">No content items found matching your search.</div>
                                )}
                            </div>
                            <div className="global-assign-step-actions">
                                <button
                                    type="button"
                                    className="global-assign-next-step-btn"
                                    onClick={handleNextStep}
                                    disabled={!formData.contentId}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Target Audience */}
                    {/* {currentStep === 2 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 2: Choose Target Audience</h2>
                            <div className="global-assign-audience-type-selection">
                                <div className="global-assign-audience-type-option">
                                    <label htmlFor="individual">Assign to Individual Users</label>
                                    <input
                                        type="radio"
                                        id="individual"
                                        name="assignType"
                                        value="individual"
                                        checked={formData.assignType === 'individual'}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="global-assign-audience-type-option">
                                    <label htmlFor="group">Assign to a Group</label>

                                    <input
                                        type="radio"
                                        id="group"
                                        name="assignType"
                                        value="group"
                                        checked={formData.assignType === 'group'}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            {formData.assignType === 'individual' ? (
                                <div className="global-assign-user-selection">
                                    <label style={{ marginBottom: '10px' }}>Select Users (by Email):</label>
                                    <input
                                        type="text"
                                        placeholder="Search users by email..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="global-assign-user-search-input"
                                    />
                                    <div className="global-assign-users-list">
                                        {filteredUsers.map(user => (
                                            <div
                                                key={user.id}
                                                className={[
                                                    "global-assign-user-item",
                                                    formData.selectedUsers.includes(user.id) ? "global-assign-selected" : ""
                                                ].filter(Boolean).join(' ')}
                                                onClick={() => handleUserSelection(user.id)}
                                            >
                                                <div className="global-assign-user-email">{user.email}</div>
                                                <div className="global-assign-user-name">{user.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="global-assign-group-selection">
                                    <label htmlFor="selectedGroup">Select Group:</label>
                                    <select
                                        id="selectedGroup"
                                        name="selectedGroup"
                                        value={formData.selectedGroup}
                                        onChange={handleInputChange}
                                        className="global-assign-group-select"
                                    >
                                        <option value="">Select a group...</option>
                                        {dummyGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="global-assign-next-step-btn"
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
                    )} */}
                    {/* {currentStep === 2 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 2: Choose Target Organization</h2>
                            <div className="global-assign-audience-type-selection">
                                <div className="global-assign-audience-type-option">
                                    <label htmlFor="individual">Assign to Individual Users</label>
                                    <input
                                        type="radio"
                                        id="individual"
                                        name="assignType"
                                        value="individual"
                                        checked={formData.assignType === 'individual'}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="global-assign-audience-type-option">
                                    <label htmlFor="group">Assign to a Group</label>

                                    <input
                                        type="radio"
                                        id="group"
                                        name="assignType"
                                        value="group"
                                        checked={formData.assignType === 'group'}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            {formData.assignType === 'individual' ? (
                                <div className="global-assign-user-selection">
                                    <label style={{ marginBottom: '10px' }}>Select Users (by Email):</label>
                                    <input
                                        type="text"
                                        placeholder="Search users by email..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                        className="global-assign-user-search-input"
                                    />
                                    <div className="global-assign-users-list">
                                        {filteredUsers.map(user => (
                                            <div
                                                key={user.id}
                                                className={[
                                                    "global-assign-user-item",
                                                    formData.selectedUsers.includes(user.id) ? "global-assign-selected" : ""
                                                ].filter(Boolean).join(' ')}
                                                onClick={() => handleUserSelection(user.id)}
                                            >
                                                <div className="global-assign-user-email">{user.email}</div>
                                                <div className="global-assign-user-name">{user.name}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="global-assign-group-selection">
                                    <label htmlFor="selectedGroup">Select Group:</label>
                                    <select
                                        id="selectedGroup"
                                        name="selectedGroup"
                                        value={formData.selectedGroup}
                                        onChange={handleInputChange}
                                        className="global-assign-group-select"
                                    >
                                        <option value="">Select a group...</option>
                                        {dummyGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="global-assign-next-step-btn"
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
                    )} */}

                    {/* Step 3: Set Dates */}
                    {currentStep === 2 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 3: Set Overall Dates</h2>

                            <div className="global-assign-dates-container">
                                {/* Assign Date */}
                                <div className="global-assign-date-field">
                                    <label>Assign On:</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.assignDate ? new Date(formData.assignDate).toLocaleDateString() : ""}
                                        onClick={() => setShowAssignDatePicker(true)}
                                        placeholder="Select Assign Date"
                                        className="global-assign-date-input"
                                    />
                                    {showAssignDatePicker && (
                                        <AddOrgDateRangePickerSingle
                                            title="Select Assign Date"
                                            selectedDate={formData.assignDate ? new Date(formData.assignDate) : null}
                                            onDateChange={(date) =>
                                                setFormData({ ...formData, assignDate: date.toISOString().split("T")[0] })
                                            }
                                            onClose={() => setShowAssignDatePicker(false)}
                                        />
                                    )}
                                </div>

                                {/* Assign Time */}
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

                                {/* Due Date */}
                                <div className="global-assign-date-field">
                                    <label>Due Date:</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : ""}
                                        onClick={() => setShowDueDatePicker(true)}
                                        placeholder="Select Due Date"
                                        className="global-assign-date-input"
                                    />
                                    {showDueDatePicker && (
                                        <AddOrgDateRangePickerSingle
                                            title="Select Due Date"
                                            isEndDate={true}
                                            startDate={formData.assignDate ? new Date(formData.assignDate) : null}
                                            selectedDate={formData.dueDate ? new Date(formData.dueDate) : null}
                                            onDateChange={(date) =>
                                                setFormData({ ...formData, dueDate: date.toISOString().split("T")[0] })
                                            }
                                            onClose={() => setShowDueDatePicker(false)}
                                        />
                                    )}
                                </div>

                                {/* Due Time */}
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

                            <div className="global-assign-date-note">
                                Assign On and Due Date/Time are mandatory.
                            </div>

                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="global-assign-next-step-btn"
                                    onClick={handleNextStep}
                                    disabled={
                                        !formData.assignDate ||
                                        !formData.assignTime ||
                                        !formData.dueDate ||
                                        !formData.dueTime
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Step 4: Notifications */}
                    {currentStep === 3 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 4: Notify Users?</h2>
                            <div className="global-assign-notification-option">

                                <input
                                    type="checkbox"
                                    id="notifyUsers"
                                    name="notifyUsers"
                                    checked={formData.notifyUsers}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="notifyUsers">Send email notification to users when assignment is created</label>

                            </div>
                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button type="button" className="global-assign-next-step-btn" onClick={handleNextStep}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Recurring */}
                    {currentStep === 4 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 5: Recurring Assignment?</h2>
                            <div className="global-assign-recurring-option">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    name="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={handleInputChange}
                                    disabled={true}
                                />
                                <label htmlFor="isRecurring">Make this a recurring assignment</label>
                                <p className="global-assign-recurring-note">(Functionality for recurring assignments is planned for later)</p>
                            </div>
                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button type="submit" className="global-assign-create-btn">
                                    Create Assignment
                                </button>
                            </div>
                        </div>
                    )}
                </form>
                <div className="global-assign-form-actions">
                    <button type="button" className="global-assign-cancel-btn" onClick={() => setCurrentStep(1)}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalCreateAssignment;
