import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  bulkDeleteUsers, 
  bulkUpdateUserGroup,
  importUsers,
  exportUsers,
  selectUser,
  deselectUser,
  selectAllUsers,
  deselectAllUsers
} from '../../../store/slices/userSlice';
import AdminForm from '../../../components/common/AdminForm/AdminForm';
import UsersTable from './components/UsersTable';
import UsersFilter from './components/UsersFilter';
import './UsersManagement.css';

const UsersManagement = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [retryCount, setRetryCount] = useState(0);
  const [filterParams, setFilterParams] = useState({});
  
  useEffect(() => {
    fetchUserData();
  }, [dispatch, currentPage, itemsPerPage]);
  
  const fetchUserData = () => {
    dispatch(fetchUsers({
      ...filterParams,
      page: currentPage,
      limit: itemsPerPage
    })).catch(error => {
      console.error('Error fetching users:', error);
    });
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchUserData();
  };
  
  const handleCreateUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };
  
  const handleEditUser = (user) => {
    // Create a properly formatted user object for the form
    const formattedUser = {
      id: user.id,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      role: user.role === 'General User' ? 'user' : user.role?.toLowerCase() || '',
      designation: user.designation || '',
      team: user.team || '',
      subTeam: user.subTeam || '',
      status: user.status || '',
      // Add any other fields that might be needed
    };
    
    setCurrentUser(formattedUser);
    setShowForm(true);
  };
  
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };
  
  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      dispatch(bulkDeleteUsers(selectedUsers));
      setSelectedUsers([]);
      setSelectAll(false);
    }
  };
  
  const handleBulkEditGroup = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to edit');
      return;
    }
    
    // Show a form to select the group
    // This could be implemented as a modal or a separate component
    const groupData = { team: 'Tech', subTeam: 'Frontend' }; // Example data
    
    dispatch(bulkUpdateUserGroup({ ids: selectedUsers, groupData }));
    setSelectedUsers([]);
    setSelectAll(false);
  };
  
  const handleImportUsers = (event) => {
    const file = event.target.files[0];
    if (file) {
      dispatch(importUsers(file));
    }
  };
  
  const handleExportUsers = () => {
    dispatch(exportUsers({}));
  };
  
  const handleFormSubmit = (formData) => {
    if (currentUser) {
      dispatch(updateUser({ id: currentUser.id, ...formData }));
    } else {
      dispatch(createUser(formData));
    }
    setShowForm(false);
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
  };
  
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      // Use displayUsers to select all users across all pages
      const allUserIds = displayUsers.map(user => user.id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };
  
  const handleSelectUser = (e, userId) => {
    if (e.target.checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    }
  };
  
  const handleFilter = (filters) => {
    setFilterParams(filters);
    setCurrentPage(1); // Reset to first page when filtering
    
    // Apply filters
    dispatch(fetchUsers({
      ...filters,
      page: 1,
      limit: itemsPerPage
    }));
  };
  
  // Add this new function to handle clearing filters
  const handleClearFilter = () => {
    // Reset filter parameters
    setFilterParams({});
    setCurrentPage(1);
    
    // Fetch all users without filters
    dispatch(fetchUsers({
      page: 1,
      limit: itemsPerPage
    }));
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Define form fields
  const userFormFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Role', type: 'select', required: true, options: [
      { value: 'user', label: 'General User' },
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'instructor', label: 'Instructor' }
    ]},
    { name: 'designation', label: 'Designation', type: 'text', required: true },
    { name: 'team', label: 'Team', type: 'select', required: true, options: [
      { value: 'Tech', label: 'Tech' },
      { value: 'HR', label: 'HR' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Sales', label: 'Sales' },
      { value: 'Finance', label: 'Finance' },
      { value: 'Operations', label: 'Operations' }
    ]},
    { name: 'subTeam', label: 'Sub Team', type: 'select', required: true, options: [
      { value: 'Frontend', label: 'Frontend' },
      { value: 'Backend', label: 'Backend' },
      { value: 'Design', label: 'Design' },
      { value: 'QA', label: 'QA' },
      { value: 'DevOps', label: 'DevOps' },
      { value: 'Mobile', label: 'Mobile' }
    ]},
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' }
    ]},
    { name: 'sendInvite', label: 'Send Invitation', type: 'checkbox', checkboxLabel: 'Send an invitation email to this user' }
  ];
  
  // Filter users based on search criteria
  const filteredUsers = users.filter(user => {
    const nameMatch = filterParams.name ? user.name?.toLowerCase().includes(filterParams.name.toLowerCase()) : true;
    const emailMatch = filterParams.email ? user.email?.toLowerCase().includes(filterParams.email.toLowerCase()) : true;
    const teamMatch = filterParams.team ? user.team === filterParams.team : true;
    const subTeamMatch = filterParams.subTeam ? user.subTeam === filterParams.subTeam : true;
    const customMatch = filterParams.custom ? 
      (user.custom1?.toLowerCase().includes(filterParams.custom.toLowerCase()) ||
       user.custom2?.toLowerCase().includes(filterParams.custom.toLowerCase())) : true;
    const statusMatch = filterParams.status ? user.status === filterParams.status : true;
    
    return nameMatch && emailMatch && teamMatch && subTeamMatch && customMatch && statusMatch;
  });
  
  // Enhanced sample data for demonstration
  const sampleUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'General User',
      designation: 'Frontend Developer',
      team: 'Tech',
      subTeam: 'Frontend',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Admin',
      designation: 'Project Manager',
      team: 'Tech',
      subTeam: 'Management',
      status: 'active'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      role: 'General User',
      designation: 'Backend Developer',
      team: 'Tech',
      subTeam: 'Backend',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'Manager',
      designation: 'HR Manager',
      team: 'HR',
      subTeam: 'Recruitment',
      status: 'active'
    },
    {
      id: 5,
      name: 'Michael Wilson',
      email: 'michael.wilson@example.com',
      role: 'General User',
      designation: 'UI Designer',
      team: 'Tech',
      subTeam: 'Design',
      status: 'active'
    },
    {
      id: 6,
      name: 'Sarah Brown',
      email: 'sarah.brown@example.com',
      role: 'Instructor',
      designation: 'Senior Trainer',
      team: 'HR',
      subTeam: 'Training',
      status: 'active'
    },
    {
      id: 7,
      name: 'David Miller',
      email: 'david.miller@example.com',
      role: 'General User',
      designation: 'Marketing Specialist',
      team: 'Marketing',
      subTeam: 'Digital',
      status: 'pending'
    },
    {
      id: 8,
      name: 'Lisa Taylor',
      email: 'lisa.taylor@example.com',
      role: 'Admin',
      designation: 'CTO',
      team: 'Tech',
      subTeam: 'Management',
      status: 'active'
    },
    {
      id: 9,
      name: 'Thomas Anderson',
      email: 'thomas.anderson@example.com',
      role: 'General User',
      designation: 'DevOps Engineer',
      team: 'Tech',
      subTeam: 'DevOps',
      status: 'active'
    },
    {
      id: 10,
      name: 'Jennifer White',
      email: 'jennifer.white@example.com',
      role: 'Manager',
      designation: 'Sales Director',
      team: 'Sales',
      subTeam: 'Management',
      status: 'active'
    },
    {
      id: 11,
      name: 'Kevin Martin',
      email: 'kevin.martin@example.com',
      role: 'General User',
      designation: 'Mobile Developer',
      team: 'Tech',
      subTeam: 'Mobile',
      status: 'suspended'
    },
    {
      id: 12,
      name: 'Amanda Clark',
      email: 'amanda.clark@example.com',
      role: 'General User',
      designation: 'Financial Analyst',
      team: 'Finance',
      subTeam: 'Accounting',
      status: 'active'
    }
  ];
  
  // Filter sample users with the same criteria as real users
  const filteredSampleUsers = sampleUsers.filter(user => {
    const nameMatch = filterParams.name ? user.name?.toLowerCase().includes(filterParams.name.toLowerCase()) : true;
    const emailMatch = filterParams.email ? user.email?.toLowerCase().includes(filterParams.email.toLowerCase()) : true;
    const teamMatch = filterParams.team ? user.team === filterParams.team : true;
    const subTeamMatch = filterParams.subTeam ? user.subTeam === filterParams.subTeam : true;
    const customMatch = filterParams.custom ? 
      (user.custom1?.toLowerCase().includes(filterParams.custom.toLowerCase()) ||
       user.custom2?.toLowerCase().includes(filterParams.custom.toLowerCase())) : true;
    const statusMatch = filterParams.status ? user.status === filterParams.status : true;
    
    return nameMatch && emailMatch && teamMatch && subTeamMatch && customMatch && statusMatch;
  });
  
  // Use sample data if no users are available or if there's an error, but apply filters to sample data
  const displayUsers = (users.length > 0 && !error) ? filteredUsers : filteredSampleUsers;
  
  // Calculate pagination
  const totalPages = Math.ceil(displayUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayUsers.slice(indexOfFirstItem, indexOfLastItem);
  
  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <div className="users_management">
      {/* <h2>Manage Users</h2> */}
      
      <UsersFilter 
        users={displayUsers}
        onFilter={handleFilter}
        handleCreateUser={handleCreateUser}
        handleImportUsers={handleImportUsers}
        handleExportUsers={handleExportUsers}
        handleBulkDelete={handleBulkDelete}
        handleBulkEditGroup={handleBulkEditGroup}
        selectedUsers={selectedUsers}
        onClearFilter={handleClearFilter} // Add this new prop
      />
      
      {showForm && (
        <div className="users_management-form-overlay">
          <AdminForm
            title={currentUser ? 'Edit User' : 'Add New User'}
            fields={userFormFields}
            initialValues={currentUser || {}}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={loading}
          />
        </div>
      )}
      
      {loading && !showForm ? (
        <div className="users_management-loading">
          <div className="users_management-loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <>
          <div className="users_management-error-container">
            <div className="users_management-error-message">
              <div className="users_management-error-icon">⚠️</div>
              <div className="users_management-error-content">
                <h3>Failed to fetch users</h3>
                <p>{error || 'Failed to fetch users'}</p>
                <button className="users_management-btn-retry" onClick={handleRetry}>
                  Retry (Attempt {retryCount + 1})
                </button>
                <p className="users_management-error-help">If the problem persists, please contact support.</p>
              </div>
            </div>
          </div>
          
          {/* Show the table with sample data even when there's an error */}
          <UsersTable 
            users={currentItems}
            selectedUsers={selectedUsers}
            handleSelectUser={handleSelectUser}
            selectAll={selectAll}
            handleSelectAll={handleSelectAll}
            handleEditUser={handleEditUser}
            handleDeleteUser={handleDeleteUser}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            pageNumbers={pageNumbers}
          />
        </>
      ) : (
        <UsersTable 
          users={currentItems}
          selectedUsers={selectedUsers}
          handleSelectUser={handleSelectUser}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          handleEditUser={handleEditUser}
          handleDeleteUser={handleDeleteUser}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          pageNumbers={pageNumbers}
        />
      )}
    </div>
  );
};

export default UsersManagement;