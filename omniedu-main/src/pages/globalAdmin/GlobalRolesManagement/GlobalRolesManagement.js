import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  deleteRole,
  createRole,
  updateRole,
} from "../../../store/slices/roleSlice";
import './GlobalRolesManagement.css'
import api from "../../../services/api";
import CustomLoader from "../../../components/common/Loading/CustomLoader";

const GlobalRolesManagement = () => {
  const dispatch = useDispatch();
  const { globalRoles, loading } = useSelector((state) => state.roles);
  const [availablePermissions, setAvailablePermissions] = useState([]); // sections + permissions
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [org,setOrg] = useState(null)
  const [orgRoles,setOrgRoles] = useState([])
  const [permissions, setPermissions] = useState([]); // structured by section
  const [organization,setOrganization] = useState(null)
  const {organizations } = useSelector(state => state.organizations);
  // console.log(globalRoles)
  useEffect(() => {
    dispatch(fetchRoles(true));
    fetchPermissions();
  }, [dispatch]);
  useEffect(() => {
    
  }, [org]);
  
  const fetchPermissions = async () => {
    const response = await api.get("/api/globalAdmin/getPermissions");
    // console.log(response.data.data)
    setAvailablePermissions(response.data.data); // array of sections with permissions
  };

  const handleAddRole = () => {
    setCurrentRole(null);
    setFormData({ name: "", description: "" });
    setPermissions([]);
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setCurrentRole(role);
    // console.log(role.sections)
    setPermissions(role.permissions)
    setFormData({
      name: role.name || "",
      description: role.description || "",
    });

    setShowForm(true);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRole({ _id: roleId, isGlobalAdmin: true }));
    }
  };

  const togglePermission = (sectionId, permId) => {
    setPermissions((prev) => {
      const section = prev.find((s) => s.section === sectionId);

      if (section) {
        const allowed = section.allowed.includes(permId)
          ? section.allowed.filter((id) => id !== permId)
          : [...section.allowed, permId];

        return prev.map((s) =>
          s.section === sectionId ? { ...s, allowed } : s
        );
      } else {
        return [...prev, { section: sectionId, allowed: [permId] }];
      }
    });
  };
  const handleSelectOrg = (orgId) =>{
    // console.log("orgId",orgId)
    setOrganization((prev) => (prev === orgId ? null : orgId)); 
} 

  const handleSaveRole = (e) => {
    e.preventDefault();

    const roleData = {
      name: formData.name,
      description: formData.description,
      organization: organization,
      permissions: permissions, // section-based permissions
    };

    if (currentRole) {
      dispatch(
        updateRole({
          id: currentRole.uuid,
          roleData,
          isGlobalAdmin: true,
        })
      );
    } else {
      dispatch(createRole({ roleData, isGlobalAdmin: true }));
    }
    setFormData({ name: "", description: "" });
    setPermissions([]);
    setCurrentRole(null);
    setShowForm(false);
  };

  return (
    <div className="global-roles-management">
      {/* Toolbar */}
      <h1 className="page-title page-title-roles">Roles</h1>
      <div className="roles-management-toolbar">
        <div className="roles-search-bar">
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
      {/* <div>
        <select>
          <option></option>
        </select>
      </div> */}
      {/* Modal */}
      {showForm && (
        <div className="roles-modal-overlay">
          <div className="roles-modal-content" style={{ width: "80%", maxWidth: "900px" }}>
            <div className="roles-modal-header">
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
              {currentRole ? "" : <div className="form-group">
                <label>Organization</label>
                <select
                  value={formData.organization}
                  onChange={(e) =>
                    handleSelectOrg(e.target.value)
                  }
                > 
                <option>Select Organization</option>
                {/* <input type="text" id="organization" name="organization"  /> */}
                  {
                    organizations.map((organization) => (
                      <option key={organization.id} value={organization._id}>
                        {organization.name}
                      </option>
                    ))
                  }
                </select>
                
              </div>}

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-sections">
                  {availablePermissions.map((section) => (
                    <div key={section.sectionId} className="permission-section">
                      <div className="section-title">{section.name}</div>
                      <div className="permissions-list">
                        {section.permissions.map((perm) => {
                          // console.log(perm)
                          // console.log(permissions)
                          // const isChecked = permissions.some(
                          //   (s) =>
                          //     s.sectionId === section.sectionId &&
                          //     s.permissions.map(p => p._id).includes(perm._id) 
                          // );
                          const isChecked = permissions.some(
                            (s) =>
                              s.section === section.sectionId &&
                              s.allowed.includes(perm._id)
                          );                          
                          return (
                            <div key={perm._id} className="permission-item">
                              <span>{perm.name}</span>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() =>
                                    togglePermission(
                                      section.sectionId,
                                      perm._id
                                    )
                                  }
                                />
                                <span className="slider"></span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
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
                    setPermissions([]);
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
          <CustomLoader text="Loading roles..." />
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
                        {role.permissions?.reduce(
                          (total, sec) => total + sec.allowed.length,
                          0
                        ) || 0}{" "}
                        /{" "}
                        {availablePermissions.reduce(
                          (total, section) => total + section.permissions.length,
                          0
                        )}
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
      {org && 
      <div className="roles-table-container">
        {loading ? (
          <CustomLoader text="Loading roles..." />
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
                        {role.permissions?.reduce(
                          (total, sec) => total + sec.allowed.length,
                          0
                        ) || 0}{" "}
                        /{" "}
                        {availablePermissions.reduce(
                          (total, section) => total + section.permissions.length,
                          0
                        )}
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
      </div>}
    </div>
  );
};

export default GlobalRolesManagement;
