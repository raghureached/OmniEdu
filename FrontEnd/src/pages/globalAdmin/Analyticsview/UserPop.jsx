import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Building2, Download } from 'lucide-react';
import api from '../../../services/api';
import LoadingScreen from '../../../components/common/Loading/Loading';

const UserPop = ({ isOpen, onClose,orgId, loading,range }) => {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');

    useEffect(()=>{
        setIsLoading(true)
        const fetchUsersData = async()=>{
            const response = await api.get(`/api/globalAdmin/analytics/users/${orgId}`,{
                params:{
                    dateRange:range
                }
            })
            // console.log(response.data.data)
            setTableData(response.data.data)
            setName(response.data.name)
            setIsLoading(false)
        }
        fetchUsersData()
    },[orgId,range])
    
    const exportToCSV = () => {
        if (tableData.length === 0) return;

        const headers = [
            'Name',
            'Email',
            'Role',
            'Last Login',
        ];

        const csvData = tableData.map(item => [
            item.name,
            item.email,
            item.role,
            formatDate(item.last_login),
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `users-analytics-${currentDate}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString();
    } 
    if (!isOpen) return null;

    return (
        <div className="analytics-modal-overlay" onClick={onClose}>
            {isLoading ? <LoadingScreen text="please wait" /> : <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
                
                <div className="analytics-modal-header">
                    <div>
                        <h2 className="analytics-modal-title">{name}</h2>
                        <p className="analytics-modal-subtitle">Comprehensive view of user information</p>
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

                <div className="analytics-modal-body">
                    {loading ? (
                        <div className="analytics-loading">
                            <div className="analytics-loading-spinner"></div>
                            <span>Loading analytics data</span>
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
                                        <th>Role</th>
                                        <th>Last Login</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((item, index) => (
                                        <tr key={index} style={{ backgroundColor: item.isActive ? '#e6f7ff' : 'white' }}>

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
                                                    <span>{item?.role || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} />
                                                    <span>{formatDate(item.last_login) || 'N/A'}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>}
        </div>
    );
};

export default UserPop;