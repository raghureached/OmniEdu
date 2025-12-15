import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  deleteRole,
  createRole,
  updateRole,
  updateOrgRole,
} from "../../../store/slices/roleSlice";
import './GlobalRolesManagement.css'
import api from "../../../services/api";
import { Edit3, Search, Trash2 } from "lucide-react";
import LoadingScreen from "../../../components/common/Loading/Loading";
import { GoOrganization, GoTrash, GoX } from "react-icons/go";
import {useNotification} from "../../../components/common/Notification/NotificationProvider";

const GlobalRolesManagement = () => {
  const dispatch = useDispatch();
  const { globalRoles, orgRoles, loading ,error} = useSelector((state) => state.roles);
  const [availablePermissions, setAvailablePermissions] = useState([]); // sections + permissions
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [currentOrg, setCurrentOrg] = useState(null)
  const [permissions, setPermissions] = useState([]);
  const [organization, setOrganization] = useState(null)
  const { organizations } = useSelector(state => state.organizations);
  const { showNotification } = useNotification();

  useEffect(() => {
    dispatch(fetchRoles("global"));
  }, [])

  useEffect(() => {
    dispatch(fetchRoles(currentOrg));
    fetchPermissions();

  }, [dispatch, currentOrg]);

  const userSections = ["Course Catalog Section","Learning Hub Section"]
  const fetchPermissions = async () => {
    const response = await api.get("/api/globalAdmin/getPermissions");
    setAvailablePermissions(response.data.data);
  };

  const handleAddRole = () => {
    setCurrentRole(null);
    setFormData({ name: "", description: "" });
    setPermissions([]);
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setCurrentRole(role);
    setPermissions(role.permissions)
    setFormData({
      name: role.name || "",
      description: role.description || "",
    });

    setShowForm(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      const resultAction = await dispatch(deleteRole({ _id: roleId, isGlobalAdmin: true }));

      if(deleteRole.fulfilled.match(resultAction)){
        showNotification({
          type: "success",
          title: "Role deleted successfully",
          message: "Role deleted successfully",
          duration: 5000,
        });
      }else{
        showNotification({
          type: "error",
          title: "Role deletion failed",
          message: error,
          duration: 5000,
        });
      }
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
  const handleSelectOrg = (orgId) => {
    setOrganization((prev) => (prev === orgId ? null : orgId));
  }
  const handleSelectCurrentOrg = (orgId) => {
    setCurrentOrg((prev) => (prev === orgId ? null : orgId));
  }
  const handleToggleRole = async(orgId,roleId) => {
    const resultAction = await dispatch(
      updateOrgRole({
        id: roleId,
        orgId:currentOrg,
      })
    );
    
    if(updateOrgRole.fulfilled.match(resultAction)){
      showNotification({
        type: "success",
        title: `Role updated for ${organizations.find((org) => org.uuid === currentOrg).name.slice(0, 7)}...`,
        message: "Role updated successfully",
        duration: 5000,
      });
    }else{
      showNotification({
        type: "error",
        title: "Role update failed",
        message: resultAction.payload.message,
        duration: 5000,
      });
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    const roleData = {
      name: formData.name,
      description: formData.description,
      organization: organization,
      permissions: permissions, // section-based permissions
    };

    if (currentRole) {
    const resultAction = await dispatch(updateRole({
      id: currentRole.uuid,
      roleData,
    }));
      
      if(updateRole.fulfilled.match(resultAction)){
        showNotification({
          type: "success",
          title: "Role updated successfully",
          message: "Role updated successfully",
          duration: 5000,
        });
        dispatch(fetchRoles(currentOrg));
      }else{
        showNotification({
          type: "error",
          title: "Role update failed",
          message: error,
          duration: 5000,
        });
      }
    } else {
    const resultAction = await dispatch(createRole({ roleData }));
      if(createRole.fulfilled.match(resultAction)){
        showNotification({
          type: "success",
          title: "Role created successfully",
          message: "Role created successfully",
          duration: 5000,
        });
      }else{
        showNotification({
          type: "error",
          title: "Role creation failed",
          message: resultAction.payload.message,
          duration: 5000,
        });
      }
    }
    setFormData({ name: "", description: "" });
    setPermissions([]);
    setCurrentRole(null);
    setShowForm(false);
  };
  if (loading) {
    return <LoadingScreen text="Loading Roles..." />
  }

  return (
    <div className="global-roles-management">
      <div className="roles-management-toolbar">
        <div className="roles-search-bar">
          <Search size={16} color="#6b7280" className="search-icon" />
          <input
            type="text"
            placeholder="Search roles"
            className="control-btn"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}>
        <div className="form-group">
          <select
            style={{ marginTop: "20px" ,transition:"all 0.3s ease",border:"2px solid #cecece",borderRadius:"12px",padding:"10px 14px",outline:"none"}}
            value={currentOrg}
            className="control-btn"
            onChange={(e) =>
              handleSelectCurrentOrg(e.target.value)
            }
            
          >
            <option value="global">Roles Available for All Organizations</option>
            {
              organizations.map((organization) => (
                <option key={organization.id} value={organization.uuid}>
                  {organization.name}
                </option>
              ))
            }
          </select>

        </div>
        {currentOrg === "global" || currentOrg === null ? <button className="btn-primary" onClick={handleAddRole}>
          + Add Role
        </button> : null}
        {/* <button className="add-btn" onClick={handleAddRole} disabled={currentOrg !== null || c}>
          + Add Role
        </button> */}
        </div>
      </div>
      {showForm && (
        <div className="addOrg-modal-overlay">
          <div className="addOrg-modal-content">
          <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <GoOrganization size={24} color="#5570f1" />
            </div>
            <div>
              <h2>{currentRole ? "Edit Role" : "Add New Role"}</h2>
              <p className="addOrg-header-subtitle">
                {currentRole ? "Update role details" : "Create a new role profile"}
              </p>
              {/* {error && <CustomError  error={error} />} */}
            </div>
          </div>
          <button 
            type="button" 
            className="addOrg-close-btn"
            onClick={() => setShowForm(false)}
            aria-label="Close modal"
          >
            <GoX size={20} />
          </button>
        </div>

            <form onSubmit={handleSaveRole} className="addOrg-org-form" style={{padding:"20px"}}>
              <div className="roles-form-group">
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

              <div className="roles-form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{minWidth:"100%",minHeight:"100px"}}
                />
              </div>

              <div className="roles-form-group">
                <label>Permissions</label>
                <div className="permissions-sections">
                  {availablePermissions.map((section) => (
                    <div key={section.sectionId} className="permission-section">
                      <div className="section-title">{section.name} {userSections.includes(section.name) && <p style={{fontSize:"10px",color:"red"}}>NOTE : Only for users</p>} </div>
                      <div className="permissions-list">
                        {section.permissions.map((perm) => {
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
              <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentRole(null);
                    setPermissions([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {currentRole ? "Update Role" : "Create Role"}
                </button>
                
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="roles-table-container">
          <div className="roles-table-container">
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
                    {currentOrg === "global" || currentOrg === null ? <td className="roles-action-cell">
                      <button
                        className="global-action-btn edit"
                        onClick={() => handleEditRole(role)}
                      >
                      <Edit3 size={14} />
                      </button>
                      <button
                        className="global-action-btn delete"
                        onClick={() => handleDeleteRole(role.uuid)}
                      >
                        <Trash2 size={14} />
                      </button>
                      
                    </td> : 
                    <td className="roles-action-cell">
                    <div key={role._id} className="permission-item">
                    <label className="toggle-switch" style={{marginBottom:"0px",bottom:"3px !important"}}>
                      <input
                        type="checkbox"
                        checked={
                          orgRoles.includes(role._id)
                        }
                        onChange={() => handleToggleRole(currentOrg,role.uuid)}
                      />
                      <span className="slider-org"></span>
                    </label>
                  </div>
                  </td>
                    }
                  </tr>
                ))} 
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
};

export default GlobalRolesManagement;
