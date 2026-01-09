import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Video, ClipboardCheck, Clock, User,Users, Calendar, TrendingUp, Download } from 'lucide-react';
import './AssignmentsPopUp.css';
import api from '../../../services/api';
import { notifyError, notifySuccess } from '../../../utils/notification';
import { useConfirm } from '../../../components/ConfirmDialogue/ConfirmDialog';

const AnalyticsPop = ({ isOpen, onClose, data, loading, hideUserName = false, analyticsType = 'module', onRefresh, assignmentId,title }) => {
    const [tableData, setTableData] = useState([]);
    const [removingId, setRemovingId] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [internalLoading, setInternalLoading] = useState(false);
    const { confirm } = useConfirm();

    useEffect(() => {
        if (assignmentId && isOpen) {
            // When assignmentId is provided, prefer fetching from backend with pagination
            loadPage(1);
            return;
        }
        if (data) {
            // Handle assessment analytics data
            if (data.assessmentInfo && data.detailedAttempts) {
                const transformedData = data.detailedAttempts.map(item => {
                    // Handle start date
                    let startedOn = 'Not Started';
                    if (item.startedAt) {
                        startedOn = new Date(item.startedAt).toLocaleDateString();
                    }

                    // Handle completion date
                    let completedOn = 'Not Completed';
                    if (item.completedAt) {
                        completedOn = new Date(item.completedAt).toLocaleDateString();
                    }

                    return {
                        userName: item.userName,
                        email: item.userEmail,
                        contentType: 'Assessment',
                        resourceName: data.assessmentInfo?.title || 'Unknown Assessment',
                        assignedOn: item.assign_on ? new Date(item.assign_on).toLocaleDateString() : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'),
                        startedOn: startedOn,
                        completedOn: completedOn,
                        score: item.score || 0,
                        status: item.status || 'not-started',
                        assignedBy: data.assessmentInfo?.organizationName || 'System',
                        actualDuration: 'N/A',
                        timeSpent: item.timeSpent || 'N/A'
                    };
                });
                setTableData(transformedData);
            }
            // Handle survey analytics data
            else if (data.surveyInfo && data.detailedResponses) {
                const transformedData = data.detailedResponses.map(item => {
                    // Handle start date
                    let startedOn = 'Not Started';
                    if (item.startedAt) {
                        startedOn = new Date(item.startedAt).toLocaleDateString();
                    }

                    // Handle completion date
                    let completedOn = 'Not Completed';
                    if (item.completedAt) {
                        completedOn = new Date(item.completedAt).toLocaleDateString();
                    }

                    return {
                        userName: item.userName,
                        email: item.userEmail,
                        contentType: 'Survey',
                        resourceName: data.surveyInfo?.title || 'Unknown Survey',
                        assignedOn: item.assign_on ? new Date(item.assign_on).toLocaleDateString() : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'),
                        startedOn: startedOn,
                        completedOn: completedOn,
                        score: '-', // Surveys don't typically have scores
                        status: item.status || 'not-started',
                        assignedBy: data.surveyInfo?.organizationName || 'System',
                        actualDuration: 'N/A',
                        timeSpent: item.timeSpent || 'N/A'
                    };
                });
                setTableData(transformedData);
            }
            // Handle learning path analytics data
            else if (data.learningPathInfo && data.detailedAssignments) {
                const transformedData = data.detailedAssignments.map(item => {
                    // Handle start date
                    let startedOn = 'Not Started';
                    if (item.startedAt) {
                        startedOn = new Date(item.startedAt).toLocaleDateString();
                    }

                    // Handle completion date
                    let completedOn = 'Not Completed';
                    if (item.completedAt) {
                        completedOn = new Date(item.completedAt).toLocaleDateString();
                    }

                    return {
                        userName: item.userName,
                        email: item.userEmail,
                        contentType: 'Learning Path',
                        resourceName: data.learningPathInfo?.title || 'Unknown Learning Path',
                        assignedOn: item.assign_on ? new Date(item.assign_on).toLocaleDateString() : (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'),
                        startedOn: startedOn,
                        completedOn: completedOn,
                        score: '-', // Learning paths don't typically have scores
                        status: item.status || 'not-started',
                        assignedBy: data.learningPathInfo?.organizationName || 'System',
                        actualDuration: 'N/A',
                        timeSpent: item.timeSpent || 'N/A'
                    };
                });
                setTableData(transformedData);
            }
            // Handle user analytics data (original logic)
            else if (data.totalAssignments) {
                // Transform the data to match the table structure
                const transformedData = data.totalAssignments.map(item => {
                    // Handle start date edge cases
                    let startedOn = 'Not Started';
                    if (item.started_at || item.startedOn) {
                        startedOn = new Date(item.started_at || item.startedOn).toLocaleDateString();
                    } else if (item.status === 'in_progress' || item.status === 'completed') {
                        // If course is in progress or completed but no explicit start date, use assignment date or created date
                        if (item.assignment_id?.assign_on || item.assignedOn) {
                            startedOn = new Date(item.assignment_id?.assign_on || item.assignedOn).toLocaleDateString();
                        } else if (item.created_at || item.createdAt) {
                            startedOn = new Date(item.created_at || item.createdAt).toLocaleDateString();
                        } else if (item.assignment_id?.contentId?.created_at) {
                            startedOn = new Date(item.assignment_id.contentId.created_at).toLocaleDateString();
                        }
                    }

                    // Handle completion date edge cases
                    let completedOn = 'Not Completed';
                    if (item.completed_at || item.completedOn) {
                        completedOn = new Date(item.completed_at || item.completedOn).toLocaleDateString();
                    } else if (item.status === 'completed') {
                        // If course is marked as completed but no explicit completion date, use last updated date
                        if (item.updated_at || item.updatedAt) {
                            completedOn = new Date(item.updated_at || item.updatedAt).toLocaleDateString();
                        } else if (item.assignment_id?.contentId?.updated_at) {
                            completedOn = new Date(item.assignment_id.contentId.updated_at).toLocaleDateString();
                        } else {
                            // Fallback: use current date if course is completed but no date found
                            completedOn = new Date().toLocaleDateString();
                        }
                    }

                    // Determine score based on content type
                    const contentType = item.assignment_id?.contentType || item.contentType || 'course';
                    const score = (contentType.toLowerCase() === 'assessment') ? (item.score || 0) : '-';
                    
                    // Map content type for display
                    const displayContentType = contentType.toLowerCase() === 'course' ? 'Module' : contentType;

                    return {
                        progressId: item.progressId,
                        userName: item.userName,
                        email: item.email,
                        contentType: displayContentType,
                        resourceName: item.resourceName || item.assignment_id?.contentId?.title || 'Unknown Resource',
                        assignedOn: item.assignedOn ? new Date(item.assignedOn).toLocaleDateString() : (item.assignment_id?.assign_on ? new Date(item.assignment_id.assign_on).toLocaleDateString() : 'N/A'),
                        startedOn: startedOn,
                        completedOn: completedOn,
                        score: score,
                        status: item.status || 'not-started',
                        assignedBy: item.assignedBy || item.assignment_id?.created_by?.name || 'System',
                        actualDuration: item.actualDuration,
                        timeSpent: item.timeSpent,
                    };
                });
                setTableData(transformedData);
            }
        }
    }, [data, assignmentId, isOpen]);

    const mapBackendItems = (items) => {
        return (items || []).map((p) => {
            const user = p.user_id || {};
            const assign = p.assignment_id || {};
            const contentTitle = assign?.contentId?.title || assign?.contentId?.name || 'Unknown Resource';
            const assignedBy = assign?.created_by?.name || 'System';
            const contentType = (assign?.contentType || p.contentType || 'course').toLowerCase();
            const displayContentType = contentType === 'course' ? 'Module' : contentType;
            return {
                progressId: p._id,
                userName: user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User',
                email: user.email || '',
                contentType: displayContentType,
                resourceName: contentTitle,
                assignedOn: assign?.assign_on ? new Date(assign.assign_on).toLocaleDateString() : 'N/A',
                startedOn: p.started_at ? new Date(p.started_at).toLocaleDateString() : 'Not Started',
                completedOn: p.completed_at ? new Date(p.completed_at).toLocaleDateString() : 'Not Completed',
                score: p.score || '-',
                status: p.status || 'not-started',
                assignedBy: assignedBy,
            };
        });
    };

    const loadPage = async (targetPage) => {
        if (!assignmentId) return;
        try {
            setInternalLoading(true);
            const res = await api.get(`/api/admin/assignments/${assignmentId}/progress`, { params: { page: targetPage, limit } });
            const payload = res?.data?.data || { items: [], total: 0, page: targetPage, limit };
            setTableData(mapBackendItems(payload.items));
            setTotal(payload.total || 0);
            setPage(payload.page || targetPage);
        } catch (e) {
            notifyError('Failed to load participants');
            setTableData([]);
            setTotal(0);
        } finally {
            setInternalLoading(false);
        }
    };

    const handleRemove = async (progressId) => {
        if (!progressId) return;
        const ok = await confirm({
            title: 'Remove Participant',
            message: 'Are you sure you want to remove this participant from the assignment?',
            confirmText: 'Remove',
            cancelText: 'Cancel',
            type: 'danger',
        })
        if (!ok) return;
        try {
            setRemovingId(progressId);
            await api.delete(`/api/admin/assignments/progress/${progressId}`);
            notifySuccess('Participant removed');
            if (assignmentId) {
                // Refresh current page from backend
                await loadPage(page);
            } else if (typeof onRefresh === 'function') {
                await onRefresh();
            }
        } catch (e) {
            notifyError('Failed to remove participant');
        } finally {
            setRemovingId(null);
        }
    };

    const getContentTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'course':
                return <BookOpen size={16} />;
            case 'assessment':
                return <ClipboardCheck size={16} />;
            case 'survey':
                return <FileText size={16} />;
            case 'learning path':
                return <Users size={16} />;
            case 'assignment':
                return <FileText size={16} />;
            case 'video':
                return <Video size={16} />;
            default:
                return <BookOpen size={16} />;
        }
    };

    const getScoreColor = (score) => {
        if (score === '-') return 'score-neutral';
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'completed': 'analytics-status-completed',
            'in_progress': 'analytics-status-in-progress',
            'not-started': 'analytics-status-not-started',
            'overdue': 'analytics-status-overdue'
        };
        return statusMap[status] || 'status-not-started';
    };

    const getContentTypeBadge = (type) => {
        const typeMap = {
            'course': 'type-course',
            'assessment': 'type-assessment',
            'survey': 'type-survey',
            'learning path': 'type-learning-path',
            'assignment': 'type-assignment',
            'video': 'type-video'
        };
        return typeMap[type?.toLowerCase()] || 'type-course';
    };

    const exportToCSV = () => {
        if (tableData.length === 0) return;

        // Define CSV headers
        const headers = [
            'User Name',
            'Type of Content',
            'Name of Resource',
            'Assigned On',
            'Started On',
            'Completed On',
            'Score',
            'Status',
            'Assigned By',
            // 'Actual Duration',
            // 'Time Spent'

        ];

        // Convert data to CSV format
        const csvData = tableData.map(item => [
            item.userName,
            item.contentType,
            item.resourceName,
            item.assignedOn,
            item.startedOn,
            item.completedOn,
            `${item.score}%`,
            item.status.replace('-', ' '),
            item.assignedBy,
            // item.actualDuration,
            // item.timeSpent
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        // Generate filename with current date
        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `learning-analytics-${currentDate}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="analytics-modal-overlay" onClick={onClose}>
            <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="analytics-modal-header">
                    <div>
                        <h2 className="analytics-modal-title">
                            title
                        </h2>
                        <p className="analytics-modal-subtitle">
                            {analyticsType === 'learningPath' 
                                ? `Assignments for ${data?.learningPathInfo?.title || 'Learning Path'}`
                                : analyticsType === 'survey' 
                                ? `Assignments for ${data?.surveyInfo?.title || 'Survey'}`
                                : analyticsType === 'assessment' 
                                ? `Assignments for ${data?.assessmentInfo?.title || 'Assessment'}`
                                : analyticsType === 'user'
                                ? 'Comprehensive view of your learning progress and performance'
                                : analyticsType === 'module'
                                ? `Assignments for ${data?.moduleInfo?.title || (data?.totalAssignments?.[0]?.assignment_id?.contentId?.title) || 'Module'}`
                                : data?.learningPathInfo 
                                ? `Assignments for ${data.learningPathInfo.title}` 
                                : data?.surveyInfo 
                                ? `Assignments for ${data.surveyInfo.title}` 
                                : data?.assessmentInfo 
                                ? `Assignments for ${data.assessmentInfo.title}` 
                                : data?.totalAssignments
                                ? `Assignments for ${data.moduleInfo?.title || (data.totalAssignments[0]?.assignment_id?.contentId?.title) || 'Module'}`
                                : 'Assignments overview'
                            }
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button 
                            className="analytics-export-btn" 
                            onClick={exportToCSV}
                            disabled={tableData.length === 0 || loading}
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                        <button className="analytics-modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="analytics-modal-body">
                    {(loading || internalLoading) ? (
                        <div className="analytics-loading">
                            <div className="analytics-loading-spinner"></div>
                            <span>Loading assignments data...</span>
                        </div>
                    ) : tableData.length === 0 ? (
                        <div className="analytics-empty-state">
                            <div className="analytics-empty-icon">
                                <BookOpen size={48} />
                            </div>
                            <h3 className="analytics-empty-title">
                                {analyticsType === 'learningPath' ? 'No Learning Path Assignments Found'
                                 : analyticsType === 'survey' ? 'No Survey Responses Found'
                                 : analyticsType === 'assessment' ? 'No Assessment Attempts Found'
                                 : analyticsType === 'user' ? 'No Learning Data Available'
                                 : analyticsType === 'module' ? 'No Module Data Available'
                                 : data?.learningPathInfo ? 'No Learning Path Assignments Found' 
                                 : data?.surveyInfo ? 'No Survey Responses Found' 
                                 : data?.assessmentInfo ? 'No Assessment Attempts Found' 
                                 : data?.totalAssignments ? 'No Module Data Available' 
                                 : 'No Data Available'}
                            </h3>
                            <p className="analytics-empty-description">
                                {analyticsType === 'learningPath' 
                                    ? 'No users have been assigned to this learning path yet. Once users are assigned, their analytics will appear here.'
                                    : analyticsType === 'survey' 
                                    ? 'No users have responded to this survey yet. Once users start responding to the survey, their analytics will appear here.'
                                    : analyticsType === 'assessment' 
                                    ? 'No users have attempted this assessment yet. Once users start taking the assessment, their analytics will appear here.'
                                    : analyticsType === 'user'
                                    ? 'Start exploring courses and assignments to see your detailed analytics here.'
                                    : analyticsType === 'module'
                                    ? `No users have been assigned to ${data?.moduleInfo?.title || (data?.totalAssignments?.[0]?.assignment_id?.contentId?.title) || 'this module'} yet. Once users are assigned, their analytics will appear here.`
                                    : data?.learningPathInfo 
                                    ? 'No users have been assigned to this learning path yet. Once users are assigned, their analytics will appear here.'
                                    : data?.surveyInfo 
                                    ? 'No users have responded to this survey yet. Once users start responding to the survey, their analytics will appear here.'
                                    : data?.assessmentInfo 
                                    ? 'No users have attempted this assessment yet. Once users start taking the assessment, their analytics will appear here.'
                                    : data?.totalAssignments
                                    ? `No users have been assigned to ${data?.moduleInfo?.title || (data?.totalAssignments[0]?.assignment_id?.contentId?.title) || 'this module'} yet. Once users are assigned, their analytics will appear here.`
                                    : 'Start exploring to see your analytics here.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="analytics-table-container">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        {!hideUserName && <th>User Name</th>}
                                        <th>Type of Content</th>
                                        <th>Name of Resource</th>
                                        <th>Assigned On</th>
                                        <th>Started On</th>
                                        <th>Completed On</th>
                                        {/* <th>Score</th> */}
                                        <th>Status</th>
                                        <th>Assigned By</th>
                                        <th>Actions</th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item, index) => (
                                        <tr key={index}>
                                            {!hideUserName && (
                                                <td>
                                                    <div className="user-name-cell">
                                                        <div className="user-info">
                                                            <div className="user-name">{item.userName}</div>
                                                            {/* <div className="user-email">{item.email}</div> */}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            <td>
                                                <div className="table-content-type">
                                                    {getContentTypeIcon(item.contentType)}
                                                    <span className={`content-type-badge ${getContentTypeBadge(item.contentType)}`}>
                                                        {item.contentType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="resource-name" title={item.resourceName}>
                                                    {item.resourceName}
                                                </div>
                                            </td>
                                            <td className="date-cell">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} />
                                                    {item.assignedOn}
                                                </div>
                                            </td>
                                            <td className="date-cell">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <TrendingUp size={12} />
                                                    {item.startedOn}
                                                </div>
                                            </td>
                                            <td className="date-cell">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <ClipboardCheck size={12} />
                                                    {item.completedOn}
                                                </div>
                                            </td>
                                            {/* <td>
                                                <span className={`score-cell ${getScoreColor(item.score)}`}>
                                                    {item.score === '-' ? '0' : item.score}%
                                                </span>
                                            </td> */}
                                            <td>
                                                <span className={`analytics-status-badge ${getStatusBadge(item.status)}`}>
                                                    {item.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="assigned-by">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={12} />
                                                    {item.assignedBy}
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className="analytics-export-btn"
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                                                    disabled={loading || removingId === item.progressId}
                                                    onClick={() => handleRemove(item.progressId)}
                                                >
                                                    {removingId === item.progressId ? 'Removing...' : 'Remove'}
                                                </button>
                                            </td>
                                              {/* <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} />
                                                    {item.actualDuration || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} />
                                                    {item.timeSpent || 'N/A'}
                                                </div>
                                            </td> */}
                                          
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 8px' }}>
                                <div>
                                    Showing {(total === 0) ? 0 : ((page - 1) * limit + 1)} - {Math.min(page * limit, total)} of {total}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="analytics-export-btn"
                                        disabled={page <= 1 || internalLoading}
                                        onClick={() => loadPage(Math.max(1, page - 1))}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        className="analytics-export-btn"
                                        disabled={page * limit >= total || internalLoading}
                                        onClick={() => loadPage(page + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPop;