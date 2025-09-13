import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  deleteRole,
  createRole,
  updateRole,
} from "../../../store/slices/roleSlice";
import './GlobalRolesManagement.css'
import { Search } from "lucide-react";

const GlobalRolesManagement = () => {
  const dispatch = useDispatch();
  const { globalRoles, loading } = useSelector((state) => state.roles);

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  }); 

  const availablePermissions = [
    { id: "view_home", label: "View Home" },
    { id: "view_training_calendar", label: "View Training Calendar" },
    { id: "view_message_board", label: "View Message Board" },
    { id: "view_learning_hub", label: "View Learning Hub" },
    { id: "view_my_training", label: "View My Training / Leaderboard" },
    { id: "view_assigned_training", label: "View Assigned Training" },
    { id: "view_additional_training", label: "View Additional Training" },
    { id: "view_mandatory_training", label: "View Mandatory Training" },
    { id: "view_course_catalog", label: "View Course Catalog" },
    { id: "view_activity_history", label: "View Activity History" },
    { id: "view_user_profile", label: "View User Profile" },
    { id: "change_password", label: "Change Password" },
    { id: "view_help_center", label: "View Help Center" },
    { id: "access_support", label: "Access Support Button" }
  ];

  useEffect(() => {
    dispatch(fetchRoles(true));
  }, [dispatch]);

  const handleAddRole = () => {
    setCurrentRole(null);
    setFormData({ name: "", description: "", permissions: [] });
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setCurrentRole(role);

    const permissionsIds = availablePermissions
      .filter((perm) => role.permissions.includes(perm.label))
      .map((perm) => perm.id);

    setFormData({
      name: role.name || "",
      description: role.description || "",
      permissions: permissionsIds,
    });
    console.log(role)
    setShowForm(true);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRole({ _id: roleId, isGlobalAdmin: true }));
    }
  };

  const togglePermission = (permId) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleSaveRole = (e) => {
    e.preventDefault();

    // Convert IDs back to labels for backend
    const roleData = {
      name: formData.name,
      description: formData.description,
      permissions: formData.permissions.map(
        (id) => availablePermissions.find((p) => p.id === id).label
      ),
    };

    if (currentRole) {
      dispatch(
        updateRole({
          _id: currentRole._id,
          roleData,
          isGlobalAdmin: true,
        })
      );
    } else {
      dispatch(createRole({ roleData, isGlobalAdmin: true }));
    }

    setFormData({ name: "", description: "", permissions: [] });
    setCurrentRole(null);
    setShowForm(false);
  };

  return (
    <div className="global-roles-management">
      {/* Toolbar */}
      <h1 className="page-title page-title-roles">Roles</h1>
      <div className="roles-management-toolbar">
        <div className="roles-search-bar">
          {/* <Search size={24} className="search-icon-roles" /> */}
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="roles-quick-add-btn" onClick={handleAddRole}>
          + Add Role
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentRole ? "Edit Role" : "Add New Role"}</h2>
            </div>

            <form onSubmit={handleSaveRole}>
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-list">
                  {availablePermissions.map((perm) => (
                    <div key={perm.id} className="permission-item">
                      <span>{perm.label}</span>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="roles-quick-add-btn">
                  {currentRole ? "Update Role" : "Create Role"}
                </button>
                <button
                  type="button"
                  className="roles-btn-delete"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentRole(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="roles-table-container">
        {loading ? (
          <div className="loading">Loading roles...</div>
        ) : (
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
              {globalRoles
                .filter((role) =>
                  role.name?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((role) => (
                  <tr key={role._id}>
                    <td className="role-name">{role.name}</td>
                    <td className="role-description">
                      {role.description || "No description"}
                    </td>
                    <td>
                      <span className="roles-permission-count">
                        {role.permissions?.length || 0} /{" "}
                        {availablePermissions.length}
                      </span>
                    </td>
                    <td className="roles-action-cell">
                      <button
                        className="roles-btn-delete"
                        onClick={() => handleDeleteRole(role.uuid)}
                      >
                        Delete
                      </button>
                      <button
                        className="roles-btn-edit"
                        onClick={() => handleEditRole(role)}
                      >
                        Edit
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

export default GlobalRolesManagement;
