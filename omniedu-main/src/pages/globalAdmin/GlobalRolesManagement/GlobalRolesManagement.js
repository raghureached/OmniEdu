import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  deleteRole,
  createRole,
  updateRole,
} from "../../../store/slices/roleSlice";
import "../.././../components/layouts/GlobalAdminLayout/GlobalAdminLayout.css";
import { motion, AnimatePresence } from 'framer-motion';


const GlobalRolesManagement = () => {
  const dispatch = useDispatch();
  const { globalRoles, loading, error } = useSelector(
    (state) => state.roles
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
const [formData, setFormData] = useState({
  name: "",
  description: "",
  permissions: [], // array of permission IDs
});

  // Available permissions for roles
  const availablePermissions = [
    // User Home Section
    { id: "view_home", label: "View Home" },
    { id: "view_training_calendar", label: "View Training Calendar" },
    { id: "view_message_board", label: "View Message Board" },

    // Learning Hub Section
    { id: "view_learning_hub", label: "View Learning Hub" },
    { id: "view_my_training", label: "View My Training / Leaderboard" },
    { id: "view_assigned_training", label: "View Assigned Training" },
    { id: "view_additional_training", label: "View Additional Training" },
    { id: "view_mandatory_training", label: "View Mandatory Training" },

    // Course Catalog Section
    { id: "view_course_catalog", label: "View Course Catalog" },

    // Activity History Section
    { id: "view_activity_history", label: "View Activity History" },

    // User Profile Section
    { id: "view_user_profile", label: "View User Profile" },
    { id: "change_password", label: "Change Password" },

    // Help Center Section
    { id: "view_help_center", label: "View Help Center" },
    { id: "access_support", label: "Access Support Button" },
  ];

  // Group permissions by category
  const permissionCategories = [
    {
      name: "User Home Section",
      permissions: [
        "view_home",
        "view_training_calendar",
        "view_message_board",
      ],
    },
    {
      name: "Learning Hub Section",
      permissions: [
        "view_learning_hub",
        "view_my_training",
        "view_assigned_training",
        "view_additional_training",
        "view_mandatory_training",
      ],
    },
    {
      name: "Course Catalog",
      permissions: ["view_course_catalog"],
    },
    {
      name: "Activity History",
      permissions: ["view_activity_history"],
    },
    {
      name: "User Profile",
      permissions: ["view_user_profile", "change_password"],
    },
    {
      name: "Help Center",
      permissions: ["view_help_center", "access_support"],
    },
  ];

  useEffect(() => {
    dispatch(fetchRoles(true)); // true for global admin roles
  }, [dispatch]);

//   const handleAddRole = () => {
//     setCurrentRole(null);
//     setShowForm(true);
    //   };
    const handleAddRole = () => {
      setCurrentRole(null);
      setFormData({ name: "", description: "", permissions: [] }); // reset
      setShowForm(true);
    };


//   const handleEditRole = (role) => {
//     setCurrentRole(role);
//     setShowForm(true);
//   };

    const handleEditRole = (role) => {
      setCurrentRole(role);
      setFormData({
        name: role.name || "",
        description: role.description || "",
        permissions: role.permissions || [],
      });
      setShowForm(true);
    };

  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      dispatch(deleteRole({ _id: roleId, isGlobalAdmin: true }));
    }
  };

  const filteredRoles = globalRoles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Calculate permission percentage for progress bar
  const getPermissionPercentage = (permissions) => {
    if (!permissions || !permissions.length) return 0;
    return Math.round((permissions.length / availablePermissions.length) * 100);
  };
// const handleSubmit = (e) => {
//   e.preventDefault();

//   const formData = new FormData(e.target);

//   const roleData = {
//     name: formData.get("name"),
//     description: formData.get("description"),
//     permissions: [
//       ...(formData.get("perm-manage-orgs") ? ["manage_organizations"] : []),
//       ...(formData.get("perm-manage-global-content")
//         ? ["manage_global_content"]
//         : []),
//       ...(formData.get("perm-manage-global-surveys")
//         ? ["manage_global_surveys"]
//         : []),
//     ],
//   };

//   if (currentRole) {
//     dispatch(
//       updateRole({ id: currentRole._id, roleData, isGlobalAdmin: true })
//     );
//   } else {
//     dispatch(createRole({ roleData, isGlobalAdmin: true }));
//   }

//   setShowForm(false);
// };
// const handleSubmit = (e) => {
//   e.preventDefault();

//   const formData = new FormData(e.currentTarget); // ✅ correct

//   const roleData = {
//     name: formData.get("name"),
//     description: formData.get("description"),
//     permissions: [
//       ...(formData.get("perm-manage-orgs") ? ["manage_organizations"] : []),
//       ...(formData.get("perm-manage-global-content")
//         ? ["manage_global_content"]
//         : []),
//       ...(formData.get("perm-manage-global-surveys")
//         ? ["manage_global_surveys"]
//         : []),
//     ],
//   };

//   if (currentRole) {
//     dispatch(
//       updateRole({ id: currentRole._id, roleData, isGlobalAdmin: true })
//     );
//   } else {
//     dispatch(createRole({ roleData, isGlobalAdmin: true }));
//   }

//   setShowForm(false);
    // };
    // const handleSubmit = (e) => {
    //   e.preventDefault();
    //   const formData = new FormData(e.currentTarget);

    //   const permissions = availablePermissions
    //     .map((perm) => (formData.get(perm.id) ? perm.id : null))
    //     .filter(Boolean);

    //   const roleData = {
    //     name: formData.get("name"),
    //     description: formData.get("description"),
    //     permissions,
    //   };

    //   if (currentRole) {
    //     dispatch(
    //       updateRole({ id: currentRole._id, roleData, isGlobalAdmin: true })
    //     );
    //   } else {
    //     dispatch(createRole({ roleData, isGlobalAdmin: true }));
    //   }

    //   setShowForm(false);
    // };
    // const handleSaveRole = () => {
    //   if (currentRole) {
    //     dispatch(
    //       updateRole({
    //         id: currentRole._id,
    //         roleData: formData,
    //         isGlobalAdmin: true,
    //       })
    //     );
    //   } else {
    //     dispatch(createRole({ roleData: formData, isGlobalAdmin: true }));
    //   }

    //   // reset
    //   setFormData({ name: "", description: "", permissions: [] });
    //   setShowForm(false);
    // };
// const handleSaveRole = (e) => {
//   e.preventDefault(); // prevent page reload

//   if (currentRole) {
//     // update existing role
//     dispatch(
//       updateRole({
//         _id: currentRole._id,
//         roleData: formData,
//         isGlobalAdmin: true,
//       })
//     );
//   } else {
//     // create new role
//     dispatch(createRole({ roleData: formData, isGlobalAdmin: true }));
//   }

//   // ✅ reset form after save
//   setFormData({ name: "", description: "", permissions: [] });
//   setCurrentRole(null);
//   setShowForm(false);
// };
// const handleSaveRole = (e) => {
//   e.preventDefault();

//   // ✅ ensure permissions array is always up-to-date
//   const roleData = {
//     name: formData.name,
//     description: formData.description,
//     permissions: [...formData.permissions], // copy checked permissions
//   };

//   if (currentRole) {
//     dispatch(
//       updateRole({
//         _id: currentRole._id, // ✅ use _id
//         roleData,
//         isGlobalAdmin: true,
//       })
//     );
//   } else {
//     dispatch(createRole({ roleData, isGlobalAdmin: true }));
//   }

//   // reset
//   setFormData({ name: "", description: "", permissions: [] });
//   setCurrentRole(null);
//   setShowForm(false);
// };
const handleSaveRole = (e) => {
  e.preventDefault();

  const roleData = {
    name: formData.name,
    description: formData.description,
    permissions: [...formData.permissions], // ✅ now always correct
  };

  if (currentRole) {
    dispatch(
      updateRole({
        _id: currentRole._id, // ✅ use correct _id
        roleData,
        isGlobalAdmin: true,
      })
    );
  } else {
    dispatch(createRole({ roleData, isGlobalAdmin: true }));
  }

  // reset form
  setFormData({ name: "", description: "", permissions: [] });
  setCurrentRole(null);
  setShowForm(false);
};

const togglePermission = (permId) => {
  setFormData((prev) => ({
    ...prev,
    permissions: prev.permissions.includes(permId)
      ? prev.permissions.filter((p) => p !== permId) // remove
      : [...prev.permissions, permId], // add
  }));
};




  return (
    <div className="global-roles-management">
      <div className="page-top">
        <h1 style={{ marginTop: "100px", paddingLeft: "20px" }}>
          Global Roles Management
        </h1>
        {/* {error && <div className="error-message">{error}</div>} */}
        {/* <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleAddRole}>
            Add Global Role
          </button>
        </div>
      </div> */}
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

      {showForm && (
        <div className="role-form">
          <h3>{currentRole ? "Edit Global Role" : "Add New Global Role"}</h3>
          <form>
            <div className="form-group">
              <label>Role Name</label>
              <select
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              >
                <option value="">Select Role</option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Global Admin">Global Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description" // ✅ add this
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                // defaultValue={currentRole?.description || ""}
              />
            </div>

            {/* <div className="form-group">
              <label>Global Permissions</label>
              <div className="permissions-list">
                {/* Mock permissions checkboxes */}
            {/* <div className="permission-item">
                  <input
                    type="checkbox"
                    id="perm-manage-orgs"
                    defaultChecked={currentRole?.permissions?.includes(
                      "manage_organizations"
                    )}
                  />
                  <label htmlFor="perm-manage-orgs">Manage Organizations</label>
                </div>
                <div className="permission-item">
                  <input
                    type="checkbox"
                    id="perm-manage-global-content"
                    defaultChecked={currentRole?.permissions?.includes(
                      "manage_global_content"
                    )}
                  />
                  <label htmlFor="perm-manage-global-content">
                    Manage Global Content
                  </label>
                </div>
                <div className="permission-item">
                  <input
                    type="checkbox"
                    id="perm-manage-global-surveys"
                    defaultChecked={currentRole?.permissions?.includes(
                      "manage_global_surveys"
                    )}
                  />
                  <label htmlFor="perm-manage-global-surveys">
                    Manage Global Surveys
                  </label>
                </div>
              </div>
            </div> */}
            {/* //updated from chatgpt */}
            <div className="form-group">
              <label>Global Permissions</label>
              <div className="permissions-list">
                {/* {availablePermissions.map((perm) => (
                  <div className="permission-item" key={perm.id}>
                    <input
                      type="checkbox"
                      id={`perm-${perm.id}`}
                      name={perm.id} // ✅ use permission id as the name
                      defaultChecked={currentRole?.permissions?.includes(
                        perm.id
                      )}
                    />
                    <label htmlFor={`perm-${perm.id}`}>{perm.label}</label>
                  </div>
                ))} */}
                {availablePermissions.map((perm) => (
                  <div key={perm.id} className="permission-item">
                    <input
                      type="checkbox"
                      id={`perm-${perm.id}`}
                      checked={formData.permissions.includes(perm.id)} // ✅ controlled
                      onChange={() => togglePermission(perm.id)} // ✅ updates state
                    />
                    <label htmlFor={`perm-${perm.id}`}>{perm.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                onClick={handleSaveRole}
              >
                {currentRole ? "Update Role" : "Create Role"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFormData({ name: "", description: "", permissions: [] }); // ✅ reset form
                  setCurrentRole(null); // ✅ clear editing state
                  setShowForm(false); // ✅ close form
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* <div className="table-container">
        {loading ? (
          <div className="loading">Loading global roles...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Users Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dummyRoles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.description}</td>
                  <td>{role.permissions?.length || 0} permissions</td>
                  <td>{role.usersCount || 0}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEditRole(role)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {dummyRoles.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-results">
                    No global roles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div> */}
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
                {globalRoles.map((role) => (
                  <motion.tr
                    key={role._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ backgroundColor: "#f8fafc" }}
                  >
                    <td className="role-name">{role.name}</td>
                    <td className="role-description">
                      {role.description || "No description"}
                    </td>
                    <td>
                      <div className="roles-permissions-info">
                        <div className="roles-permission-count">
                          {role.permissions?.length || 0} of{" "}
                          {availablePermissions.length} permissions
                        </div>
                        <div className="roles-permission-progress-container">
                          <div
                            className="roles-permission-progress"
                            style={{
                              width: `${getPermissionPercentage(
                                role.permissions
                              )}%`,
                            }}
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
                          onClick={() => handleDeleteRole(role._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {globalRoles.length === 0 && (
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
    </div>
  );
};

export default GlobalRolesManagement;
