import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Building2, Download } from 'lucide-react';

const User = ({ isOpen, onClose, data, loading }) => {
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        if (data && data.users) {
            // Transform the user data to match the table structure
            const transformedData = data.users.map(user => ({
                name: user.name || 'Unknown User',
                email: user.email || 'No Email',
                organization: user.organization?.name || 'No Organization',
                lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
            }));
            setTableData(transformedData);
        }
    }, [data]);
    
    const exportToCSV = () => {
        if (tableData.length === 0) return;

        // Define CSV headers
        const headers = [
            'Name',
            'Email',
            'Organization',
            'Last Login',
        ];

        // Convert data to CSV format
        const csvData = tableData.map(item => [
            item.name,
            item.email,
            item.organization,
            item.lastLogin,
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
        link.setAttribute('download', `users-analytics-${currentDate}.csv`);
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
                        <h2 className="analytics-modal-title">User Analytics</h2>
                        <p className="analytics-modal-subtitle">Comprehensive view of user information and activity</p>
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
                                <User size={48} />
                            </div>
                            <h3 className="analytics-empty-title">No User Data Available</h3>
                            <p className="analytics-empty-description">
                                No user information is available to display.
                            </p>
                        </div>
                    ) : (
                        <div className="analytics-table-container">
                            <table className="analytics-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Organization</th>
                                        <th>Last Login</th>
                                        {/* <th>Time Spent</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <User size={16} />
                                                    <span>{item.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span>{item.email}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Building2 size={14} />
                                                    <span>{item.organization}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} />
                                                    <span>{item.lastLogin}</span>
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

export default UserPop;