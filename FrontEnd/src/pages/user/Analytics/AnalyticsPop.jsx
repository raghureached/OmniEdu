import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Video, ClipboardCheck, Clock, User, Calendar, TrendingUp, Download } from 'lucide-react';
import './AnalyticsPop.css';

const AnalyticsPop = ({ isOpen, onClose,data,loading }) => {
    const [tableData, setTableData] = useState([]);
    // console.log(data)

    useEffect(() => {
        if (data && data.totalAssignments) {
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

                return {
                    contentType: contentType,
                    resourceName: item.assignment_id?.contentId?.title || 'Unknown Resource',
                    assignedOn: item.assignment_id?.assign_on ? new Date(item.assignment_id.assign_on).toLocaleDateString() : 'N/A',
                    startedOn: startedOn,
                    completedOn: completedOn,
                    score: score,
                    status: item.status || 'not-started',
                    assignedBy: item.assignment_id?.created_by?.name || 'System',

                };
            });
            setTableData(transformedData);
        }
    }, [data]);
    console.log(tableData)
    const getContentTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'course':
                return <BookOpen size={16} />;
            case 'assessment':
                return <ClipboardCheck size={16} />;
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
            'completed': 'status-completed',
            'in_progress': 'status-in-progress',
            'not-started': 'status-not-started',
            'overdue': 'status-overdue'
        };
        return statusMap[status] || 'status-not-started';
    };

    const getContentTypeBadge = (type) => {
        const typeMap = {
            'course': 'type-course',
            'assessment': 'type-assessment',
            'assignment': 'type-assignment',
            'video': 'type-video'
        };
        return typeMap[type?.toLowerCase()] || 'type-course';
    };

    const exportToCSV = () => {
        if (tableData.length === 0) return;

        // Define CSV headers
        const headers = [
            'Type of Content',
            'Name of Resource',
            'Assigned On',
            'Started On',
            'Completed On',
            'Score',
            'Status',
            'Assigned By',
        ];

        // Convert data to CSV format
        const csvData = tableData.map(item => [
            item.contentType,
            item.resourceName,
            item.assignedOn,
            item.startedOn,
            item.completedOn,
            `${item.score}%`,
            item.status.replace('-', ' '),
            item.assignedBy,
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
                        <h2 className="analytics-modal-title">Detailed Learning Analytics</h2>
                        <p className="analytics-modal-subtitle">Comprehensive view of your learning progress and performance</p>
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
                            <h3 className="analytics-empty-title">No Learning Data Available</h3>
                            <p className="analytics-empty-description">
                                Start exploring courses and assignments to see your detailed analytics here.
                            </p>
                        </div>
                    ) : (
                        <div className="analytics-table-container">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>Type of Content</th>
                                        <th>Name of Resource</th>
                                        <th>Assigned On</th>
                                        <th>Started On</th>
                                        <th>Completed On</th>
                                        <th>Score</th>
                                        <th>Status</th>
                                        <th>Assigned By</th>
                                        {/* <th>Time Spent</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item, index) => (
                                        <tr key={index}>
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
                                                    {item.score}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadge(item.status)}`}>
                                                    {item.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            <td className="assigned-by">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={12} />
                                                    {item.assignedBy}
                                                </div>
                                            </td>
                                            
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