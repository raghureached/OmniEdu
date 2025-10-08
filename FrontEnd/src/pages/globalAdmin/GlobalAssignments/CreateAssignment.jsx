import React, { useEffect, useState } from 'react';
import './CreateAssignment.css';
import AddOrgDateRangePickerSingle from '../../../components/common/CustomDatePicker/DateRangePicker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContent } from '../../../store/slices/contentSlice';
import { createGlobalAssignment } from '../../../store/slices/globalAssignmentSlice';
import { fetchGlobalAssessments, updateGlobalAssessment } from '../../../store/slices/globalAssessmentSlice';
import { fetchOrganizations } from '../../../store/slices/organizationSlice';
import { fetchSurveys } from '../../../store/slices/surveySlice';
import { ChevronLeft, ChevronRight, Filter, Plus, Search, X } from 'lucide-react';
import LoadingScreen from '../../../components/common/Loading/Loading';

const GlobalCreateAssignment = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchContent());
        dispatch(fetchGlobalAssessments());
        dispatch(fetchOrganizations());
        dispatch(fetchSurveys());
    }, [dispatch]);
    const [showFilters, setShowFilters] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showAssignDatePicker, setShowAssignDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [contentType, setContentType] = useState('');
    const { organizations,loading } = useSelector(state => state.organizations);
    const { surveys } = useSelector(state => state.surveys);
    const { items: content } = useSelector(state => state.content);
    const { assessments } = useSelector(state => state.globalAssessments);
    const [orgSearchTerm, setOrgSearchTerm] = useState('');
    const [selectedOrgs, setSelectedOrgs] = useState([]);

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
        orgIds: []
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
    const handleclickOutSide = () => setShowFilters(false);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        formData.orgIds = selectedOrgs;
        try {
            // Create the assignment first
            await dispatch(createGlobalAssignment(formData)).unwrap();
            // If the content is an Assessment, publish it
            if (formData.contentType === 'Assessment' && formData.contentId) {
                const id = formData.contentId; // uuid
                await dispatch(updateGlobalAssessment({ id, data: { status: 'Published' } })).unwrap();
                // Optionally refresh assessments list
                dispatch(fetchGlobalAssessments());
            }
        } catch (err) {
            // swallow here; existing slice handles error state
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
            orgIds: []
        });
        setSelectedOrgs([]);

        setCurrentStep(1);
    };
    const handleFilters = () => {
        if (showFilters) {
            clearFilters();
            setShowFilters(false);
        } else {
            setShowFilters(true);
        }
    }

    const handleFilterChange = (e) => {
        setContentType(e.target.value);
        setContentSearchTerm('');
        setShowFilters(false)
    }
    const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
    const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const [contentSearchTerm, setContentSearchTerm] = useState('');
    let allContentItems;
    if (contentType === 'Module') {
        allContentItems = content;
    } else if (contentType === 'Assessment') {
        allContentItems = assessments;
    } else if (contentType === 'Survey') {
        allContentItems = surveys;
    } else {
        allContentItems = [...content, ...assessments, ...surveys];
    }
    const clearFilters = () => {
        setContentType('');
        setContentSearchTerm('');
    }
    const filteredContentItems = allContentItems.filter(item =>
        item.title.toLowerCase().includes(contentSearchTerm.toLowerCase())
    );
    const handleAddOrg = (orgId) => {
        if (selectedOrgs.includes(orgId)) {
            setSelectedOrgs(selectedOrgs.filter(org => org !== orgId));
        } else {
            setSelectedOrgs([...selectedOrgs, orgId]);
        }
    }

    const stepTitles = [
        'Choose Organization',
        'Choose Content',
        'Dates & Configuration'
    ];
    const filteredOrganizations = organizations.filter(org =>
        org.email.toLowerCase().includes(orgSearchTerm.toLowerCase())
    ).slice(0, 5);
    const handleSelectAll = () => {
        if (selectedOrgs.length === filteredOrganizations.length) {
            setSelectedOrgs([]);
        } else {
            setSelectedOrgs(filteredOrganizations.map(org => org.uuid));
        }
        formData.orgIds = selectedOrgs
    };
    if(loading){
        return <LoadingScreen text="Loading Content..."/>
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

                    {/* Step 1: Choose Organization */}
                    {currentStep === 1 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 1: Choose Target Audience</h2>
                            {/* <div className="global-assign-content-selection-note">Select one Organization to assign.</div> */}
                            <div className='roles-search-bar'>
                                <Search size={16} color="#6b7280" className="search-icon" style={{ top: "33%" }} />
                                <input
                                    type="text"
                                    placeholder="Search by Email"
                                    value={orgSearchTerm}
                                    onChange={(e) => setOrgSearchTerm(e.target.value)}
                                    style={{ marginBottom: '20px', paddingLeft: "35px" }}
                                />
                            </div>

                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '2px solid #dee2e6'
                                    }}>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            width: '50px'
                                        }}>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => handleSelectAll()}
                                                checked={selectedOrgs.length === filteredOrganizations.length}
                                                style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            color: '#2c3e50'
                                        }}>Name</th>
                                        <th style={{
                                            padding: '16px',
                                            textAlign: 'left',
                                            color: '#2c3e50'
                                        }}>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrganizations.map(org => (
                                        <tr
                                            key={org.id}
                                            onClick={() => handleAddOrg(org.uuid)}
                                            style={{
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #e9ecef',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'left'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => handleAddOrg(org.uuid)}
                                                    name="orgId"
                                                    value={org.uuid}
                                                    checked={selectedOrgs.includes(org.uuid)}
                                                    style={{
                                                        width: '14px',
                                                        height: '14px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </td>
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'left',
                                                color: '#495057',
                                                fontWeight: 500,
                                                fontSize: '0.9rem'
                                            }}>{org.name}</td>
                                            <td style={{
                                                padding: '16px',
                                                textAlign: 'left',
                                                color: '#6c757d',
                                                fontSize: '0.9rem'
                                            }}>{org.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="global-assign-step-actions" style={{ marginTop: '50px' }}>
                                <div className="global-assign-form-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setCurrentStep(1)}>
                                        Cancel
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleNextStep}
                                    disabled={!selectedOrgs.length}
                                >
                                    Next <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Content */}
                    {currentStep === 2 && (
                        <div className="global-assign-assignment-step-content">
                            <h2 className="global-assign-step-title">Step 2: Choose Content to Assign</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="Search Modules, Assessments, Learning Paths, Surveys by name..."
                                    value={contentSearchTerm}
                                    onChange={(e) => setContentSearchTerm(e.target.value)}
                                    className="global-assign-content-search-input"
                                />
                                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid #ccc', padding: '10px 15px', borderRadius: '10px', backgroundColor: '#f5f5f5', width: 'fit-content' }} onClick={() => handleFilters()}>{showFilters && contentType ? "Clear" : <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Filter size={20} />Filter</span>}</span>
                            </div>
                            {showFilters && <div className='filter-overlay' style={{ padding: '10px 15px' }}>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Filters</span>
                                    <span style={{ cursor: 'pointer' }}><X size={20} onClick={() => setShowFilters(false)} /></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ fontWeight: 'bold' }}>Type</label>
                                    <select value={contentType} onChange={(e) => handleFilterChange(e)} name="contentType">
                                        <option value="">Select Content Type</option>
                                        <option value="Module">Module</option>
                                        <option value="Assessment">Assessment</option>
                                        <option value="Survey">Survey</option>
                                    </select>
                                </div>
                            </div>}
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
                                            <div style={{display:'flex',alignItems:'center',gap:'10px',justifyContent:'space-between'}}>
                                            <div>
                                                <div className="global-assign-content-item-type">
                                                    {assessments.includes(item)
                                                        ? 'Assessment'
                                                        : surveys.includes(item)
                                                            ? 'Survey'
                                                            : 'Module'}
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

                    {/* Step 3: Set Dates */}
                    {currentStep === 3 && (
                        <div className="global-assign-assignment-step-content">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h2 className="global-assign-step-title">Step 3: Dates & Configuration</h2>
                                <p style={{ color: "#666", fontSize: "14px", fontWeight: "bold" }}>Selected content duration: {getDuration(formData.contentId)}</p>
                            </div>
                            <div className="global-assign-dates-container" style={{ marginTop: "20px" }}>
                                {/* <h2>Dates</h2>   */}
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
