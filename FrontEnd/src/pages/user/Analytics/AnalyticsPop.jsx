import React, { useState, useEffect } from 'react';
import { X, BookOpen, FileText, Video, ClipboardCheck, Clock, User, Calendar, TrendingUp, Download } from 'lucide-react';
import './AnalyticsPop.css';

const AnalyticsPop = ({ isOpen, onClose,data,loading }) => {
    const [tableData, setTableData] = useState([]);
    // console.log(data)

    useEffect(() => {
        const items = Array.isArray(data?.totalAssignments)
            ? data.totalAssignments
            : (Array.isArray(data?.data?.totalAssignments) ? data.data.totalAssignments : []);
        if (items.length > 0) {
            const normalizeType = (t) => {
                if (!t) return '';
                const s = String(t).trim().toLowerCase().replace(/\s+/g, '');
                if (s === 'learningpath') return 'Learning Path';
                if (s === 'course' || s === 'module') return 'Module';
                if (s === 'assessment' || s === 'quiz') return 'Assessment';
                if (s === 'survey') return 'Survey';
                if (s === 'document' || s === 'doc') return 'Document';
                if (s === 'scorm') return 'SCORM';
                return t;
            };

            const toDate = (d) => {
                try { return d ? new Date(d).toLocaleDateString() : null; } catch { return null; }
            };

            const transformedData = items.map(item => {
                const assn = item.assignment_id;
                const enroll = item.enrollment_id;
                const content = assn?.contentId || enroll?.contentId || {};

                // Assigned/enrolled on
                const assignedOn = toDate(assn?.assign_on) || toDate(enroll?.assign_on) || 'N/A';

                // Started on
                let startedOn = 'Not Started';
                const startedCandidate = item.started_at || assn?.assign_on || enroll?.assign_on || item.created_at || content?.created_at || content?.createdAt;
                if (item.status === 'in_progress' || item.status === 'completed') {
                    startedOn = toDate(item.started_at) || toDate(assn?.assign_on) || toDate(enroll?.assign_on) || toDate(item.created_at) || toDate(content?.created_at) || 'Not Started';
                } else {
                    startedOn = toDate(item.started_at) || 'Not Started';
                }

                // Completed on
                let completedOn = 'Not Completed';
                if (item.completed_at) {
                    completedOn = toDate(item.completed_at) || 'Not Completed';
                } else if (item.status === 'completed') {
                    completedOn = toDate(item.updated_at) || toDate(content?.updated_at) || toDate(content?.updatedAt) || toDate(new Date());
                }

                // Type and score
                const rawType = item.contentType || assn?.contentType || enroll?.contentType || content?.type || '';
                const contentType = normalizeType(rawType) || 'Module';
                const score = contentType === 'Assessment' ? (item.score ?? '-') : '-';

                return {
                    contentType,
                    resourceName: content?.title || 'Unknown Resource',
                    assignedOn,
                    startedOn,
                    completedOn,
                    score,
                    status: item.status || 'not-started',
                    assignedBy: assn?.created_by?.name || 'System',
                };
            });
            setTableData(transformedData);
        } else {
            setTableData([]);
        }
    }, [data]);
    console.log(tableData)
    const getContentTypeIcon = (type) => {
        const t = String(type || '').toLowerCase().replace(/\s+/g, '');
        switch (t) {
            case 'module':
            case 'course':
                return <BookOpen size={16} />;
            case 'assessment':
                return <ClipboardCheck size={16} />;
            case 'survey':
                return <FileText size={16} />;
            case 'learningpath':
                return <TrendingUp size={16} />;
            case 'document':
                return <FileText size={16} />;
            case 'scorm':
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
            'assigned': 'status-not-started',
            'enrolled': 'status-not-started',
            'not-started': 'status-not-started',
            'expired': 'status-overdue',
            'overdue': 'status-overdue'
        };
        return statusMap[status] || 'status-not-started';
    };

    const getContentTypeBadge = (type) => {
        const t = String(type || '').toLowerCase().replace(/\s+/g, '');
        const typeMap = {
            'module': 'type-course',
            'course': 'type-course',
            'assessment': 'type-assessment',
            'survey': 'type-assignment',
            'learningpath': 'type-assignment',
            'document': 'type-assignment',
            'scorm': 'type-video'
        };
        return typeMap[t] || 'type-course';
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
            item.score === '-' ? '-' : `${item.score}%`,
            String(item.status || '').replace('-', ' '),
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
                                        <th>Score(%)</th>
                                        <th>Status</th>
                                        
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
                                                    {item.score}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusBadge(item.status)}`}>
                                                    {item.status.replace('-', ' ')}
                                                </span>
                                            </td>
                                            {/* <td className="assigned-by">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <User size={12} />
                                                    {item.assignedBy}
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