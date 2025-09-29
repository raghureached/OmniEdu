import React, { useEffect, useState } from 'react';
import './CreateAssignment.css';
import AddOrgDateRangePickerSingle from '../../../components/common/CustomDatePicker/DateRangePicker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent } from '../../../store/slices/contentSlice';
import { createGlobalAssignment } from '../../../store/slices/globalAssignmentSlice';
import { fetchGlobalAssessments } from '../../../store/slices/globalAssessmentSlice';
import { fetchOrganizations } from '../../../store/slices/organizationSlice';
import { fetchSurveys } from '../../../store/slices/surveySlice';

const GlobalCreateAssignment = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchContent());
        dispatch(fetchGlobalAssessments());
        dispatch(fetchOrganizations());
        dispatch(fetchSurveys());
    }, [dispatch]);

    const [currentStep, setCurrentStep] = useState(1);
    const [showAssignDatePicker, setShowAssignDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    const { organizations } = useSelector(state => state.organizations);
    const { surveys } = useSelector(state => state.surveys);
    const { items: content, loading } = useSelector(state => state.content);
    const { assessments } = useSelector(state => state.globalAssessments);

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
        orgId: ''
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    const getDuration = (item) => {
        const contentItem = allContentItems.find((contentItem) => contentItem.uuid === item)
        return contentItem?.duration + " minutes"
    }

    const handleContentSelection = (item) => {
        setFormData({
            ...formData,
            contentId: item.uuid,
            contentName: item.title,
            contentType: assessments.includes(item)
                ? 'Assessment'
                : surveys.includes(item)
                ? 'Survey'
                : 'Module'
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(createGlobalAssignment(formData));
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
            isRecurring: false,
            orgId: ''
        });

        setCurrentStep(1);
    };

    const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
    const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const [contentSearchTerm, setContentSearchTerm] = useState('');
    const allContentItems = [...content, ...assessments, ...surveys];
    const filteredContentItems = allContentItems.filter(item =>
        item.title.toLowerCase().includes(contentSearchTerm.toLowerCase())
    );

    const stepTitles = [
        'Choose Organization',
        'Choose Content',
        'Set Dates',
        'Notifications',
        'Recurring'
    ];

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

                    {/* Step 1: Choose Organization */}
                    {currentStep === 1 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 1: Choose Target Audience</h2>
                            <div className="global-assign-content-selection-note">Select one Organization to assign.</div>
                            <select value={formData.orgId} onChange={handleInputChange} name="orgId">
                                <option value="">Select Organization</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.uuid}>{org.name}</option>
                                ))}
                            </select>
                            <div className="global-assign-step-actions">
                                <button
                                    type="button"
                                    className="global-assign-next-step-btn"
                                    onClick={handleNextStep}
                                    disabled={!formData.orgId}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Content */}
                    {currentStep === 2 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 2: Choose Content to Assign</h2>
                            <input
                                type="text"
                                placeholder="Search Modules, Assessments, Learning Paths, Surveys by name..."
                                value={contentSearchTerm}
                                onChange={(e) => setContentSearchTerm(e.target.value)}
                                className="global-assign-content-search-input"
                            />
                            <div className="global-assign-content-items-list">
                                {filteredContentItems.length > 0 ? (
                                    filteredContentItems.slice(0, 8).map(item => (
                                        <div
                                            key={item._id}
                                            className={[
                                                'global-assign-content-item',
                                                formData.contentId === item.uuid ? 'global-assign-selected' : ''
                                            ].filter(Boolean).join(' ')}
                                            onClick={() => handleContentSelection(item)}
                                        >
                                            <div className="global-assign-content-item-type">
                                                {assessments.includes(item)
                                                    ? 'Assessment'
                                                    : surveys.includes(item)
                                                    ? 'Survey'
                                                    : 'Module'}
                                            </div>
                                            <div className="global-assign-content-item-name">{item.title.toUpperCase()}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="global-assign-no-content-found">
                                        No content items found matching your search.
                                    </div>
                                )}
                            </div>
                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button type="button" className="global-assign-next-step-btn" onClick={handleNextStep} disabled={!formData.contentId}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Set Dates */}
                    {currentStep === 3 && (
                        <div className="global-assign-assignment-step-content">
                            <div style={{display: "flex", justifyContent: "space-between"}}>
                            <h2 className="global-assign-step-title">Step 3: Set Overall Dates</h2>
                            <p style={{color: "#666", fontSize: "14px",fontWeight: "bold"}}>Selected content duration: {getDuration(formData.contentId)}</p>
                            </div>
                            <div className="global-assign-dates-container">

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

                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="global-assign-next-step-btn"
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
                                <label htmlFor="notifyUsers">Send email notification to users</label>
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
                    {currentStep === 5 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 5: Recurring Assignment?</h2>
                            <div className="global-assign-recurring-option">
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
                            <div className="global-assign-step-actions">
                                <button type="button" className="global-assign-prev-step-btn" onClick={handlePrevStep}>
                                    Previous
                                </button>
                                <button type="submit" className="global-assign-create-btn">
                                    {loading ? 'Creating Assignment...' : 'Create Assignment'}
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
