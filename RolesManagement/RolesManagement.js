import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoles, deleteRole, createRole, updateRole } from '../../../store/slices/roleSlice';
import { motion, AnimatePresence } from 'framer-motion';
import './RolesManagement.css';

const RolesManagement = () => {
  const dispatch = useDispatch();
  const { adminRoles, loading, error } = useSelector((state) => state.roles);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  // Dummy data for when API fails
  const dummyRoles = [
    {
      id: 1,
      name: 'General User',
      description: 'Basic access to learning content and personal dashboard',
      permissions: ['view_home', 'view_training_calendar', 'view_message_board', 'view_learning_hub', 'view_my_training', 'view_assigned_training', 'view_user_profile', 'change_password', 'view_help_center', 'access_support'],
      usersCount: 42
    },
    {
      id: 2,
      name: 'Manager / Trainer / SME',
      description: 'Can manage courses, users and view analytics',
      permissions: ['view_home', 'view_training_calendar', 'view_message_board', 'view_learning_hub', 'view_my_training', 'view_assigned_training', 'view_additional_training', 'view_mandatory_training', 'view_course_catalog', 'view_activity_history', 'view_user_profile', 'change_password', 'view_help_center', 'access_support'],
      usersCount: 15
    },
    {
      id: 3,
      name: 'Administrator',
      description: 'Full access to all system features',
      permissions: ['view_home', 'view_training_calendar', 'view_message_board', 'view_learning_hub', 'view_my_training', 'view_assigned_training', 'view_additional_training', 'view_mandatory_training', 'view_course_catalog', 'view_activity_history', 'view_user_profile', 'change_password', 'view_help_center', 'access_support'],
      usersCount: 5
    }
  ];
  
  // Available permissions for roles
  const availablePermissions = [
    // User Home Section
    { id: 'view_home', label: 'View Home' },
    { id: 'view_training_calendar', label: 'View Training Calendar' },
    { id: 'view_message_board', label: 'View Message Board' },
    
    // Learning Hub Section
    { id: 'view_learning_hub', label: 'View Learning Hub' },
    { id: 'view_my_training', label: 'View My Training / Leaderboard' },
    { id: 'view_assigned_training', label: 'View Assigned Training' },
    { id: 'view_additional_training', label: 'View Additional Training' },
    { id: 'view_mandatory_training', label: 'View Mandatory Training' },
    
    // Course Catalog Section
    { id: 'view_course_catalog', label: 'View Course Catalog' },
    
    // Activity History Section
    { id: 'view_activity_history', label: 'View Activity History' },
    
    // User Profile Section
    { id: 'view_user_profile', label: 'View User Profile' },
    { id: 'change_password', label: 'Change Password' },
    
    // Help Center Section
    { id: 'view_help_center', label: 'View Help Center' },
    { id: 'access_support', label: 'Access Support Button' }
  ];
  
  // Group permissions by category
  const permissionCategories = [
    { 
      name: 'User Home Section', 
      permissions: ['view_home', 'view_training_calendar', 'view_message_board'] 
    },
    { 
      name: 'Learning Hub Section', 
      permissions: ['view_learning_hub', 'view_my_training', 'view_assigned_training', 'view_additional_training', 'view_mandatory_training'] 
    },
    { 
      name: 'Course Catalog', 
      permissions: ['view_course_catalog'] 
    },
    { 
      name: 'Activity History', 
      permissions: ['view_activity_history'] 
    },
    { 
      name: 'User Profile', 
      permissions: ['view_user_profile', 'change_password'] 
    },
    { 
      name: 'Help Center', 
      permissions: ['view_help_center', 'access_support'] 
    }
  ];
  
  useEffect(() => {
    dispatch(fetchRoles(false)); // false for admin roles
  }, [dispatch]);
  
  useEffect(() => {
    // Reset form data when currentRole changes
    if (currentRole) {
      setFormData({
        name: currentRole.name || '',
        description: currentRole.description || '',
        permissions: currentRole.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
  }, [currentRole]);
  
  const handleAddRole = () => {
    setCurrentRole(null);
    setShowForm(true);
  };
  
  const handleEditRole = (role) => {
    setCurrentRole(role);
    setShowForm(true);
  };
  
  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      dispatch(deleteRole({ id: roleId, isGlobalAdmin: false }));
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handlePermissionChange = (permissionId) => {
    setFormData(prevData => {
      const updatedPermissions = prevData.permissions.includes(permissionId)
        ? prevData.permissions.filter(id => id !== permissionId)
        : [...prevData.permissions, permissionId];
      
      return {
        ...prevData,
        permissions: updatedPermissions
      };
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentRole) {
      dispatch(updateRole({
        id: currentRole.id,
        roleData: formData,
        isGlobalAdmin: false
      }));
    } else {
      dispatch(createRole({
        roleData: formData,
        isGlobalAdmin: false
      }));
    }
    
    setShowForm(false);
  };
  
  // Use dummy data if there's an error or no roles are available
  const displayRoles = error || adminRoles.length === 0 ? dummyRoles : adminRoles;
  
  const filteredRoles = displayRoles.filter(role => 
    role.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate permission percentage for progress bar
  const getPermissionPercentage = (permissions) => {
    if (!permissions || !permissions.length) return 0;
    return Math.round((permissions.length / availablePermissions.length) * 100);
  };
  
  return (
    <motion.div 
      className="roles-management"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* <h2>Manage Roles (User Permissions)</h2> */}
      <p className="roles-subtitle">Define roles and control which features are available to users on their dashboard.</p>
      
      <div className="roles-management-toolbar">
        <div className="roles-search-container">
          <div className="roles-search-bar">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <motion.button 
            className="roles-btn-primary roles-quick-add-btn"
            onClick={handleAddRole}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Role
          </motion.button>
        </div>
      </div>
      
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="role-form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3>{currentRole ? 'Edit Role' : 'Add New Role'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="roles-form-group">
                <label>Role Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="roles-form-group">
                <label>Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="roles-form-group roles-permissions-section">
                <label>Dashboard Permissions</label>
                
                {permissionCategories.map(category => (
                  <div key={category.name} className="roles-permission-category">
                    <h4>{category.name}</h4>
                    <div className="roles-permissions-grid">
                      {availablePermissions
                        .filter(perm => category.permissions.includes(perm.id))
                        .map(permission => (
                          <div className="roles-permission-item" key={permission.id}>
                            <input 
                              type="checkbox" 
                              id={`perm-${permission.id}`} 
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                            />
                            <label htmlFor={`perm-${permission.id}`}>{permission.label}</label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="roles-form-actions">
                <motion.button 
                  type="button" 
                  className="roles-btn-secondary"
                  onClick={() => setShowForm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  type="submit" 
                  className="roles-btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentRole ? 'Update Role' : 'Create Role'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="roles-roles-table-container">
        {loading ? (
          <div className="roles-loading">
            <div className="roles-spinner"></div>
            <p>Loading roles...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <table className="roles-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map(role => (
                  <motion.tr 
                    key={role.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ backgroundColor: '#f8fafc' }}
                  >
                    <td className="role-name">{role.name}</td>
                    <td className="role-description">{role.description || 'No description'}</td>
                    <td>
                      <div className="roles-permissions-info">
                        <div className="roles-permission-count">
                          {role.permissions?.length || 0} of {availablePermissions.length} permissions
                        </div>
                        <div className="roles-permission-progress-container">
                          <div 
                            className="roles-permission-progress" 
                            style={{ width: `${getPermissionPercentage(role.permissions)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="roles-action-cell">
                        <motion.button 
                          className="roles-btn-edit"
                          onClick={() => handleEditRole(role)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button 
                          className="roles-btn-delete"
                          onClick={() => handleDeleteRole(role.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan="4" className="roles-no-results">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default RolesManagement;