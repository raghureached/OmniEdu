import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, deleteAssignment } from '../../../store/slices/assignmentSlice';
import './ManageAssignment.css';

const ManageAssignment = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.assignments);
  
  // State for filters
  const [contentSearch, setContentSearch] = useState('');
  const [userGroupSearch, setUserGroupSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dummy data for demonstration
  const dummyAssignments = [
    {
      id: 1,
      contentName: 'Introduction to HTML',
      contentType: 'Module',
      assignedTo: 'John Doe',
      assignOn: '2025-04-20 09:00',
      dueDate: '2025-05-04 17:00',
      status: 'In Progress'
    },
    {
      id: 2,
      contentName: 'Frontend Onboarding',
      contentType: 'Learning Path',
      assignedTo: 'Frontend Devs (Group)',
      assignOn: '2025-04-21 10:00',
      dueDate: '2025-06-21 17:00',
      status: 'Pending Start'
    },
    {
      id: 3,
      contentName: 'JavaScript Fundamentals',
      contentType: 'Module',
      assignedTo: 'Sarah Johnson',
      assignOn: '2025-04-15 11:00',
      dueDate: '2025-05-15 17:00',
      status: 'Completed'
    },
    {
      id: 4,
      contentName: 'React Basics',
      contentType: 'Assessment',
      assignedTo: 'Dev Team (Group)',
      assignOn: '2025-04-10 09:30',
      dueDate: '2025-04-25 17:00',
      status: 'Overdue'
    }
  ];
  
  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);
  
  const handleDeleteAssignment = (assignmentId) => {
    if (window.confirm('Are you sure you want to unassign this content?')) {
      dispatch(deleteAssignment(assignmentId));
    }
  };
  
  // Apply filters to assignments
  const filteredAssignments = dummyAssignments.filter(assignment => {
    const matchesContent = assignment.contentName.toLowerCase().includes(contentSearch.toLowerCase());
    const matchesUserGroup = assignment.assignedTo.toLowerCase().includes(userGroupSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    
    return matchesContent && matchesUserGroup && matchesStatus;
  });
  
  // Handle filter reset
  const handleFilterReset = () => {
    setContentSearch('');
    setUserGroupSearch('');
    setStatusFilter('all');
  };
  
  return (
    <div className="assignments-container">
      <div className="assignments-page-header">
        {/* <h1>Manage Assignments</h1> */}
      </div>
      
      <div className="assignments-filter-section">
        <div className="assignments-filter-row">
          <div className="assignments-filter-group">
            <label>Content Name:</label>
            <input
              type="text"
              placeholder="Search content..."
              value={contentSearch}
              onChange={(e) => setContentSearch(e.target.value)}
            />
          </div>
          
          <div className="assignments-filter-group">
            <label>User/Group:</label>
            <input
              type="text"
              placeholder="Search user/group..."
              value={userGroupSearch}
              onChange={(e) => setUserGroupSearch(e.target.value)}
            />
          </div>
          
          <div className="assignments-filter-group">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Pending Start">Pending Start</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
        
        <div className="assignments-filter-actions">
          <button className="assignments-btn-filter">Filter</button>
          <button className="assignments-btn-reset" onClick={handleFilterReset}>Reset</button>
        </div>
      </div>
      
      {/* Always show dummy data instead of loading/error states */}
      <div className="assignments-list">
        {filteredAssignments.length === 0 ? (
          <div className="assignments-no-data">No assignments found</div>
        ) : (
          <table className="assignments-data-table">
            <thead>
              <tr>
                <th>Content Name</th>
                <th>Content Type</th>
                <th>Assigned To</th>
                <th>Assign On</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.contentName}</td>
                  <td>{assignment.contentType}</td>
                  <td>{assignment.assignedTo}</td>
                  <td>{assignment.assignOn}</td>
                  <td>{assignment.dueDate}</td>
                  <td>
                    <span className={`assignments-status-badge ${assignment.status.toLowerCase().replace(' ', '-')}`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="assignments-actions-cell">
                    <button className="assignments-btn-view">View Details</button>
                    <button className="assignments-btn-edit">Edit</button>
                    <button 
                      className="assignments-btn-unassign"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageAssignment;