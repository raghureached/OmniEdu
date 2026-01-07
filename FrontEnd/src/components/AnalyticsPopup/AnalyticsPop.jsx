import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Video, ClipboardCheck, Clock, User,Users, Calendar, TrendingUp, Download } from 'lucide-react';
import './AnalyticsPop.css';

const AnalyticsPop = ({ isOpen, onClose, data, loading, hideUserName = false, analyticsType = 'module' }) => {
    const [tableData, setTableData] = useState([]);
    console.log('AnalyticsPop received data:', data);
    console.log('AnalyticsPop loading:', loading);

    useEffect(() => {
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
                    if (item.started_at) {
                        startedOn = new Date(item.started_at).toLocaleDateString();
                    } else if (item.status === 'in_progress' || item.status === 'completed') {
                        // If course is in progress or completed but no explicit start date, use assignment date or created date
                        if (item.assignment_id?.assign_on) {
                            startedOn = new Date(item.assignment_id.assign_on).toLocaleDateString();
                        } else if (item.created_at) {
                            startedOn = new Date(item.created_at).toLocaleDateString();
                        } else if (item.assignment_id?.contentId?.created_at) {
                            startedOn = new Date(item.assignment_id.contentId.created_at).toLocaleDateString();
                        }
                    }

                    // Handle completion date edge cases
                    let completedOn = 'Not Completed';
                    if (item.completed_at) {
                        completedOn = new Date(item.completed_at).toLocaleDateString();
                    } else if (item.status === 'completed') {
                        // If course is marked as completed but no explicit completion date, use last updated date
                        if (item.updated_at) {
                            completedOn = new Date(item.updated_at).toLocaleDateString();
                        } else if (item.assignment_id?.contentId?.updated_at) {
                            completedOn = new Date(item.assignment_id.contentId.updated_at).toLocaleDateString();
                        } else {
                            // Fallback: use current date if course is completed but no date found
                            completedOn = new Date().toLocaleDateString();
                        }
                    }

                    // Determine score based on content type
                    const contentType = item.assignment_id?.contentType || 'course';
                    const score = (contentType.toLowerCase() === 'assessment') ? (item.score || 0) : '-';
                    
                    // Map content type for display
                    const displayContentType = contentType.toLowerCase() === 'course' ? 'Module' : contentType;

                    return {
                        userName: item.userName,
                        email: item.email,
                        contentType: displayContentType,
                        resourceName: item.assignment_id?.contentId?.title || 'Unknown Resource',
                        assignedOn: item.assignment_id?.assign_on ? new Date(item.assignment_id.assign_on).toLocaleDateString() : 'N/A',
                        startedOn: startedOn,
                        completedOn: completedOn,
                        score: score,
                        status: item.status || 'not-started',
                        assignedBy: item.assignment_id?.created_by?.name || 'System',
                         actualDuration: item.actualDuration,
                        timeSpent: item.timeSpent,
                       

                    };
                });
                setTableData(transformedData);
            }
        }
    }, [data]);
    console.log(tableData)
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
                            {analyticsType === 'learningPath' ? 'Learning Path Analytics' 
                             : analyticsType === 'survey' ? 'Survey Analytics' 
                             : analyticsType === 'assessment' ? 'Assessment Analytics' 
                             : analyticsType === 'user' ? 'Detailed Learning Analytics' 
                             : analyticsType === 'module' ? 'Module Analytics' 
                             : data?.learningPathInfo ? 'Learning Path Analytics' 
                             : data?.surveyInfo ? 'Survey Analytics' 
                             : data?.assessmentInfo ? 'Assessment Analytics' 
                             : data?.totalAssignments ? 'Module Analytics' 
                             : 'Analytics'}
                        </h2>
                        <p className="analytics-modal-subtitle">
                            {analyticsType === 'learningPath' 
                                ? `Analytics for ${data?.learningPathInfo?.title || 'Learning Path'}`
                                : analyticsType === 'survey' 
                                ? `Analytics for ${data?.surveyInfo?.title || 'Survey'}`
                                : analyticsType === 'assessment' 
                                ? `Analytics for ${data?.assessmentInfo?.title || 'Assessment'}`
                                : analyticsType === 'user'
                                ? 'Comprehensive view of your learning progress and performance'
                                : analyticsType === 'module'
                                ? `Analytics for ${data?.moduleInfo?.title || (data?.totalAssignments?.[0]?.assignment_id?.contentId?.title) || 'Module'}`
                                : data?.learningPathInfo 
                                ? `Analytics for ${data.learningPathInfo.title}` 
                                : data?.surveyInfo 
                                ? `Analytics for ${data.surveyInfo.title}` 
                                : data?.assessmentInfo 
                                ? `Analytics for ${data.assessmentInfo.title}` 
                                : data?.totalAssignments
                                ? `Analytics for ${data.moduleInfo?.title || (data.totalAssignments[0]?.assignment_id?.contentId?.title) || 'Module'}`
                                : 'Analytics overview'
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
                    {loading ? (
                        <div className="analytics-loading">
                            <div className="analytics-loading-spinner"></div>
                            <span>Loading analytics data...</span>
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
                                        <th>Score</th>
                                        <th>Status</th>
                                        <th>Assigned By</th>
                                        {/* <th>Actual Duration</th>
                                        <th>Time Spent</th> */}
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
                                            <td>
                                                <span className={`score-cell ${getScoreColor(item.score)}`}>
                                                    {item.score === '-' ? '0' : item.score}%
                                                </span>
                                            </td>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPop;