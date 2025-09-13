import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    uploadOrganizationDocument,
    deleteOrganizationDocument,
    setFilters,
    clearFilters
} from '../../../store/slices/organizationSlice';
import './OrganizationManagement.css';
import { format } from "date-fns";
import LoadingScreen from '../../../components/common/Loading/Loading';

const OrganizationManagement = () => {
  const dispatch = useDispatch();
  const { organizations, loading, error, filters, totalCount } = useSelector(
    (state) => state.organizations
  );

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [currentOrg, setCurrentOrg] = useState(null);
  // const [formData, setFormData] = useState({
  //   name: "",
  //   logo: null,
  //   email: "",
  //   status: "Active",
  //   planId: "",
  //   // planName: "",
  //   startDate: "",
  //   endDate: "",
  //   adminRoleId: "",
  // });
  // inside formData state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    logo: null,
    planId: "", // ✅ required
    start_date: "", // ✅ match backend
    end_date: "", // ✅ match backend
    adminRoleId: "",
  });

  const [documents, setDocuments] = useState([]);
  const [newDocuments, setNewDocuments] = useState([]);

  // Status options
  const statusOptions = ["Active", "Inactive", "Suspended"];

  // Plan options (would come from API in real app)
  const planOptions = [
    { id: "basic", name: "Basic Plan" },
    { id: "standard", name: "Standard Plan" },
    { id: "premium", name: "Premium Plan" },
  ];

  // Role options (would come from API in real app)
  const roleOptions = [
    { id: "org-admin", name: "Organization Admin" },
    { id: "org-manager", name: "Organization Manager" },
  ];

  useEffect(() => {
    dispatch(fetchOrganizations(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(
      setFilters({
        [name]: value,
      })
    );
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  const openForm = (org = null) => {
    if (org) {
      setEditMode(true);
      setCurrentOrg(org);
      setFormData({
        name: org.name || "",
        email: org.email || "",
        status: org.status || "Active",
        logo: null, // Don't set the logo file here
        planId: org.planId || "",
        // planName: org.planName || "",
        startDate: org.start_Date
          ? new Date(org.start_Date).toISOString().split("T")[0]
          : "",
        endDate: org.end_Date
          ? new Date(org.end_Date).toISOString().split("T")[0]
          : "",
        adminRoleId: org.adminRoleId || "",
      });
      setDocuments(org.documents || []);
    } else {
      setEditMode(false);
      setCurrentOrg(null);
      setFormData({
        name: "",
        email: "",
        status: "Active",
        logo: null,
        planId: "",
        // planName: "",
        start_Date: "",
        end_Date: "",
        adminRoleId: "",
      });
      setDocuments([]);
    }
    setNewDocuments([]);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentOrg(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    console.log(type, value, name);
    if (type === "file" && name === "logo") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      setSelectedLogo(file);
      setShowPreview(false);
    } else if (type === "file" && name === "documents") {
      setNewDocuments([...newDocuments, ...Array.from(files)]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editMode && currentOrg) {
      try {
        dispatch(
          updateOrganization({ id: currentOrg.id, data: { ...formData } })
        ).then(() => {
          newDocuments.forEach((doc, index) => {
            dispatch(
              uploadOrganizationDocument({
                orgId: currentOrg.id,
                document: doc,
              })
            );
          });
          closeForm();
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        dispatch(createOrganization(formData)).then((result) => {
          if (result.payload && result.payload.id) {
            newDocuments.forEach((doc, index) => {
              dispatch(
                uploadOrganizationDocument({
                  orgId: result.payload.id,
                  document: doc,
                })
              );
            });
            closeForm();
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

    const handleDeleteOrg = (id) => {
      if (window.confirm("Are you sure you want to delete this organization?")) {
        try {
          dispatch(deleteOrganization({ id }));
        } catch (error) {
          console.error(error);
        }
      }
    };

  const handleDeleteDocument = (docId) => {
    if (
      currentOrg &&
      window.confirm("Are you sure you want to delete this document?")
    ) {
      dispatch(
        deleteOrganizationDocument({
          orgId: currentOrg.id,
          docId,
        })
      ).then(() => {
        setDocuments(documents.filter((doc) => doc.id !== docId));
      });
    }
  };

  const handleRemoveNewDocument = (index) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };
  //pagination code
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentpages = organizations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(organizations.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // id generator function
  //Random ID generator
  // const generatePlanId = (planCode) => {
  //   const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  //   return `ORG-${planCode}-${randomPart}-${new Date().getFullYear()}`;
  // };

  // Handler
  // const handlePlanChange = (e) => {
  //   const selectedPlanCode = e.target.value;
  //   const selectedPlan = planOptions.find((plan) => plan.id === selectedPlanCode);

  //   setFormData({
  //     ...formData,
  //     planName: selectedPlan ? selectedPlan.name : "",
  //     // planId: selectedPlan ? generatePlanId(selectedPlan.id) : "",
  //   });
  // };
  // Plan change handler
  // const handlePlanChange = (e) => {
  //   const selectedPlanId = e.target.value;
  //   const selectedPlan = planOptions.find((plan) => plan.id === selectedPlanId);

  //   setFormData({
  //     ...formData,
  //     // planId: selectedPlan ? selectedPlan.id : "",
  //     planName: selectedPlan ? selectedPlan.name : "",
  //   });
  // };
  // Plan change handler
  // const handlePlanChange = (e) => {
  //   const selectedPlanId = e.target.value;

  //   setFormData({
  //     ...formData,
  //     planId: selectedPlanId, // only keep planId
  //   });
  // };
const handlePlanChange = (e) => {
  const selectedPlanId = e.target.value;
  setFormData({
    ...formData,
    planId: selectedPlanId, // ✅ backend needs this
  });
};

  return (
    <div className="organization-management">
      <h1>Organization Management</h1>

      {/* {error && <div className="error-message">{error}</div>} */}

      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Filter by name"
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Plan Name</label>
            <select
              name="planName"
              value={filters.planName}
              onChange={handleFilterChange}
            >
              <option value="">All Plans</option>
              {planOptions.map((plan) => (
                <option key={plan.id} value={plan.name}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={resetFilters} className="btn-secondary">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button onClick={() => openForm()} className="btn-primary">
          Add Organization
        </button>
      </div>

      {loading ? <LoadingScreen /> : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Org Name</th>
                  <th>Logo</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Plan ID</th>
                  <th>Plan Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              {/* <tbody>
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No organizations found
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr key={org.id}>
                      <td>{org.org_Name}</td>
                      <td>
                        {org.org_Logo && (
                          <img
                            src={org.org_Logo}
                            alt={`${org.org_Name} logo`}
                            className="org-logo"
                          />
                        )}
                      </td>
                      <td>{org.org_Email}</td>
                      <td>
                        <span className={`status-badge ${org.org_Status}`}>
                          {org.org_Status}
                        </span>
                      </td>
                      <td>{org.org_Plan_ID}</td>
                      <td>{org.org_Plan_Name}</td>
                      <td>{org.org_Start_Date}</td>
                      <td>{org.org_End_Date}</td>
                      <td>
                        {org.org_Documents?.length > 0 ? (
                          <span className="document-count">
                            {org.org_Documents.length} docs
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => openForm(org)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOrg(org.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody> */}
              <tbody>
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No organizations found
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td>
                        {org.logo && (
                          <img
                            src={org.logo_url}
                            alt={`${org.name} logo`}
                            className="org-logo"
                          />
                        )}
                      </td>
                      <td>{org.email}</td>
                      <td>
                        <span className={`status-badge ${org.status}`}>
                          {org.status}
                        </span>
                      </td>
                      <td>{org.planId}</td>
                      <td>{org.planName}</td>
                      <td>
                        {org.start_date
                          ? new Date(org.start_date).toISOString().split("T")[0]
                          : "N/A"}
                      </td>
                      <td>
                        {org.end_date
                          ? new Date(org.end_date).toISOString().split("T")[0]
                          : "N/A"}
                      </td>

                      <td>
                        {org.documents?.length > 0 ? (
                          <span className="document-count">
                            {org.documents.length} docs
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => openForm(org)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOrg(org.id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>

          {/* <div className="pagination-info">
            Showing {dummyorgs.length} of {20} organizations
          </div> */}
        </>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editMode ? "Edit Organization" : "Add Organization"}</h2>
              <button onClick={closeForm} className="close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="org-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Organization Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Contact Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="logo">Logo</label>
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                  {/* Preview Button (only if file selected) */}
                  {selectedLogo && (
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="btn-secondary"
                      style={{ marginTop: "10px" }}
                    >
                      Preview Logo
                    </button>
                  )}

                  {/* Old Logo (only when editing and no new logo selected) */}
                  {!selectedLogo && editMode && currentOrg?.logoUrl && (
                    <div className="current-logo">
                      <img
                        src={currentOrg.logoUrl}
                        alt="Current logo"
                        className="logo-preview-small"
                      />
                      <span>Current logo</span>
                    </div>
                  )}
                  {showPreview && selectedLogo && (
                    <div className="preview-overlay">
                      <div className="preview-content">
                        <button
                          className="close-preview"
                          onClick={() => setShowPreview(false)}
                        >
                          &times;
                        </button>
                        <img
                          src={URL.createObjectURL(selectedLogo)}
                          alt="Full Preview"
                          className="preview-image"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ padding: "11px 2px" }}
                    required
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="planId">Plan *</label>
                  <select
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    onChange={handlePlanChange}
                    required
                  >
                    <option value="">Select a Plan</option>
                    {planOptions.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* updated for plan id */}
                {/* <div className="form-group">
                  <label htmlFor="planId">Generated Plan ID</label>
                  <input
                    type="text"
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    readOnly
                  />
                </div> */}
                {/* <div className="form-group">
                  <label htmlFor="planName">Plan *</label>
                  <select
                    id="planName"
                    name="planName"
                    value={formData.planName}
                    onChange={handlePlanChange} // ✅ use this one
                    required
                  >
                    <option value="">Select a Plan</option>
                    {planOptions.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="planId">Generated Plan ID</label>
                  <input
                    type="text"
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    readOnly
                  />
                </div> */}
                {/* <div className="form-group">
                  <label htmlFor="planId">Select Plan *</label>
                  <select
                    id="planId"
                    name="planId"
                    value={formData.planName} // show selected plan's name
                    onChange={handlePlanChange}
                    required
                  >
                    <option value="">Select a Plan</option>
                    {planOptions.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div> */}

                {/* <div className="form-group">
                  <label htmlFor="planId">Generated Plan ID</label>
                  <input
                    type="text"
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    readOnly
                  />
                </div> */}
                {/* updated  */}
                {/* <div className="form-group">
  <label htmlFor="planId">Plan *</label>
  <select
    id="planId"
    name="planId"
    value={formData.planId}
    onChange={handlePlanChange}
    required
  >
    <option value="">Select a Plan</option>
    {planOptions.map((plan) => (
      <option key={plan.id} value={plan.id}>
        {plan.name}
      </option>
    ))}
  </select>
</div> */}

                <div className="form-group">
                  <label htmlFor="adminRoleId">
                    Assign Role for Org Admin *
                  </label>
                  <select
                    id="adminRoleId"
                    name="adminRoleId"
                    value={formData.adminRoleId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a Role</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_Date">Start Date *</label>
                  <input
                    type="date"
                    id="start_Date"
                    name="start_Date"
                    value={formData.start_Date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_Date">End Date *</label>
                  <input
                    type="date"
                    id="end_Date"
                    name="end_Date"
                    value={formData.end_Date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Document Management Section */}
              <div className="document-section">
                <h3>Documents</h3>

                {/* Existing Documents */}
                {documents.length > 0 && (
                  <div className="existing-documents">
                    <h4>Existing Documents</h4>
                    <ul className="document-list">
                      {documents.map((doc) => (
                        <li key={doc.id} className="document-item">
                          <span className="document-name">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="btn-delete-doc"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* New Documents */}
                <div className="new-documents">
                  <h4>Upload New Documents</h4>
                  <div className="document-upload">
                    <input
                      type="file"
                      id="documents"
                      name="documents"
                      onChange={handleInputChange}
                      multiple
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("documents").click()
                      }
                      className="btn-upload"
                    >
                      Select Files
                    </button>
                  </div>

                  {newDocuments.length > 0 && (
                    <ul className="document-list">
                      {newDocuments.map((doc, index) => (
                        <li key={index} className="document-item">
                          <span className="document-name">{doc.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewDocument(index)}
                            className="btn-delete-doc"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editMode ? "Update Organization" : "Create Organization"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
 export default OrganizationManagement;







































        // <div className = "organization-management" >
        //     <
        //     h1 > Organization Management < /h1>

        //     {
        //         error && < div className = "error-message" > { error } < /div>}

        //         <
        //         div className = "filter-section" >
        //             <
        //             div className = "filter-row" >
        //             <
        //             div className = "filter-group" >
        //             <
        //             label > Name < /label> <
        //             input
        //         type = "text"
        //         name = "name"
        //         value = { filters.name }
        //         onChange = { handleFilterChange }
        //         placeholder = "Filter by name" /
        //             >
        //             <
        //             /div>

        //         <
        //         div className = "filter-group" >
        //             <
        //             label > Status < /label> <
        //             select
        //         name = "status"
        //         value = { filters.status }
        //         onChange = { handleFilterChange } >
        //             <
        //             option value = "" > All Statuses < /option> {
        //                 statusOptions.map(status => ( <
        //                     option key = { status }
        //                     value = { status } > { status.charAt(0).toUpperCase() + status.slice(1) } <
        //                     /option>
        //                 ))
        //             } <
        //             /select> <
        //             /div>

        //         <
        //         div className = "filter-group" >
        //             <
        //             label > Plan Name < /label> <
        //             select
        //         name = "planName"
        //         value = { filters.planName }
        //         onChange = { handleFilterChange } >
        //             <
        //             option value = "" > All Plans < /option> {
        //                 planOptions.map(plan => ( <
        //                     option key = { plan.id }
        //                     value = { plan.name } > { plan.name } <
        //                     /option>
        //                 ))
        //             } <
        //             /select> <
        //             /div>

        //         <
        //         div className = "filter-actions" >
        //             <
        //             button onClick = { resetFilters }
        //         className = "btn-secondary" >
        //             Reset Filters <
        //             /button> <
        //             /div> <
        //             /div> <
        //             /div>

        //         <
        //         div className = "action-bar" >
        //             <
        //             button onClick = {
        //                 () => openForm() }
        //         className = "btn-primary" >
        //             Add Organization <
        //             /button> <
        //             /div>

        //         {
        //             loading ? ( <
        //                 div className = "loading" > Loading organizations... < /div>
        //             ) : ( <
        //                 >
        //                 <
        //                 div className = "table-container" >
        //                 <
        //                 table className = "data-table" >
        //                 <
        //                 thead >
        //                 <
        //                 tr >
        //                 <
        //                 th > Org Name < /th> <
        //                 th > Logo < /th> <
        //                 th > Email < /th> <
        //                 th > Status < /th> <
        //                 th > Plan ID < /th> <
        //                 th > Plan Name < /th> <
        //                 th > Start Date < /th> <
        //                 th > End Date < /th> <
        //                 th > Documents < /th> <
        //                 th > Actions < /th> <
        //                 /tr> <
        //                 /thead> <
        //                 tbody > {
        //                     organizations.length === 0 ? ( <
        //                         tr >
        //                         <
        //                         td colSpan = "10"
        //                         className = "no-data" >
        //                         No organizations found <
        //                         /td> <
        //                         /tr>
        //                     ) : (
        //                         organizations.map((org) => ( <
        //                             tr key = { org.id } >
        //                             <
        //                             td > { org.name } < /td> <
        //                             td > {
        //                                 org.logoUrl && ( <
        //                                     img src = { org.logoUrl }
        //                                     alt = { `${org.name} logo` }
        //                                     className = "org-logo" /
        //                                     >
        //                                 )
        //                             } <
        //                             /td> <
        //                             td > { org.email } < /td> <
        //                             td >
        //                             <
        //                             span className = { `status-badge ${org.status}` } > { org.status } <
        //                             /span> <
        //                             /td> <
        //                             td > { org.planId } < /td> <
        //                             td > { org.planName } < /td> <
        //                             td > { org.startDate } < /td> <
        //                             td > { org.endDate } < /td> <
        //                             td > {
        //                                 org.documents ? .length > 0 ? ( <
        //                                     span className = "document-count" > { org.documents.length }
        //                                     docs <
        //                                     /span>
        //                                 ) : (
        //                                     '-'
        //                                 )
        //                             } <
        //                             /td> <
        //                             td className = "actions-cell" >
        //                             <
        //                             button onClick = {
        //                                 () => openForm(org) }
        //                             className = "btn-edit" >
        //                             Edit <
        //                             /button> <
        //                             button onClick = {
        //                                 () => handleDeleteOrg(org.id) }
        //                             className = "btn-delete" >
        //                             Delete <
        //                             /button> <
        //                             /td> <
        //                             /tr>
        //                         ))
        //                     )
        //                 } <
        //                 /tbody> <
        //                 /table> <
        //                 /div>

        //                 <
        //                 div className = "pagination-info" >
        //                 Showing { organizations.length }
        //                 of { totalCount }
        //                 organizations <
        //                 /div> <
        //                 />
        //             )
        //         }

        //         {
        //             showForm && ( <
        //                 div className = "modal-overlay" >
        //                 <
        //                 div className = "modal-content" >
        //                 <
        //                 div className = "modal-header" >
        //                 <
        //                 h2 > { editMode ? 'Edit Organization' : 'Add Organization' } < /h2> <
        //                 button onClick = { closeForm }
        //                 className = "close-btn" >
        //                 &
        //                 times; <
        //                 /button> <
        //                 /div>

        //                 <
        //                 form onSubmit = { handleSubmit }
        //                 className = "org-form" >
        //                 <
        //                 div className = "form-row" >
        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "name" > Organization Name * < /label> <
        //                 input type = "text"
        //                 id = "name"
        //                 name = "name"
        //                 value = { formData.name }
        //                 onChange = { handleInputChange }
        //                 required /
        //                 >
        //                 <
        //                 /div>

        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "email" > Contact Email * < /label> <
        //                 input type = "email"
        //                 id = "email"
        //                 name = "email"
        //                 value = { formData.email }
        //                 onChange = { handleInputChange }
        //                 required /
        //                 >
        //                 <
        //                 /div> <
        //                 /div>

        //                 <
        //                 div className = "form-row" >
        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "logo" > Logo < /label> <
        //                 input type = "file"
        //                 id = "logo"
        //                 name = "logo"
        //                 onChange = { handleInputChange }
        //                 accept = "image/*" /
        //                 > {
        //                     editMode && currentOrg ? .logoUrl && ( <
        //                         div className = "current-logo" >
        //                         <
        //                         img src = { currentOrg.logoUrl }
        //                         alt = "Current logo"
        //                         className = "logo-preview" /
        //                         >
        //                         <
        //                         span > Current logo < /span> <
        //                         /div>
        //                     )
        //                 } <
        //                 /div>

        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "status" > Status * < /label> <
        //                 select id = "status"
        //                 name = "status"
        //                 value = { formData.status }
        //                 onChange = { handleInputChange }
        //                 required >
        //                 {
        //                     statusOptions.map(status => ( <
        //                         option key = { status }
        //                         value = { status } > { status.charAt(0).toUpperCase() + status.slice(1) } <
        //                         /option>
        //                     ))
        //                 } <
        //                 /select> <
        //                 /div>

        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "planId" > Plan * < /label> <
        //                 select id = "planId"
        //                 name = "planId"
        //                 value = { formData.planId }
        //                 onChange = { handlePlanChange }
        //                 required >
        //                 <
        //                 option value = "" > Select a Plan < /option> {
        //                     planOptions.map(plan => ( <
        //                         option key = { plan.id }
        //                         value = { plan.id } > { plan.name } <
        //                         /option>
        //                     ))
        //                 } <
        //                 /select> <
        //                 /div>

        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "adminRoleId" > Assign Role
        //                 for Org Admin * < /label> <
        //                 select id = "adminRoleId"
        //                 name = "adminRoleId"
        //                 value = { formData.adminRoleId }
        //                 onChange = { handleInputChange }
        //                 required >
        //                 <
        //                 option value = "" > Select a Role < /option> {
        //                     roleOptions.map(role => ( <
        //                         option key = { role.id }
        //                         value = { role.id } > { role.name } <
        //                         /option>
        //                     ))
        //                 } <
        //                 /select> <
        //                 /div> <
        //                 /div>

        //                 <
        //                 div className = "form-row" >
        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "startDate" > Start Date * < /label> <
        //                 input type = "date"
        //                 id = "startDate"
        //                 name = "startDate"
        //                 value = { formData.startDate }
        //                 onChange = { handleInputChange }
        //                 required /
        //                 >
        //                 <
        //                 /div>

        //                 <
        //                 div className = "form-group" >
        //                 <
        //                 label htmlFor = "endDate" > End Date * < /label> <
        //                 input type = "date"
        //                 id = "endDate"
        //                 name = "endDate"
        //                 value = { formData.endDate }
        //                 onChange = { handleInputChange }
        //                 required /
        //                 >
        //                 <
        //                 /div> <
        //                 /div>

        //                 { /* Document Management Section */ } <
        //                 div className = "document-section" >
        //                 <
        //                 h3 > Documents < /h3>

        //                 { /* Existing Documents */ } {
        //                     documents.length > 0 && ( <
        //                         div className = "existing-documents" >
        //                         <
        //                         h4 > Existing Documents < /h4> <
        //                         ul className = "document-list" > {
        //                             documents.map(doc => ( <
        //                                 li key = { doc.id }
        //                                 className = "document-item" >
        //                                 <
        //                                 span className = "document-name" > { doc.name } < /span> <
        //                                 button type = "button"
        //                                 onClick = {
        //                                     () => handleDeleteDocument(doc.id) }
        //                                 className = "btn-delete-doc" >
        //                                 Delete <
        //                                 /button> <
        //                                 /li>
        //                             ))
        //                         } <
        //                         /ul> <
        //                         /div>
        //                     )
        //                 }

        //                 { /* New Documents */ } <
        //                 div className = "new-documents" >
        //                 <
        //                 h4 > Upload New Documents < /h4> <
        //                 div className = "document-upload" >
        //                 <
        //                 input type = "file"
        //                 id = "documents"
        //                 name = "documents"
        //                 onChange = { handleInputChange }
        //                 multiple /
        //                 >
        //                 <
        //                 button type = "button"
        //                 onClick = {
        //                     () => document.getElementById('documents').click() }
        //                 className = "btn-upload" >
        //                 Select Files <
        //                 /button> <
        //                 /div>

        //                 {
        //                     newDocuments.length > 0 && ( <
        //                         ul className = "document-list" > {
        //                             newDocuments.map((doc, index) => ( <
        //                                 li key = { index }
        //                                 className = "document-item" >
        //                                 <
        //                                 span className = "document-name" > { doc.name } < /span> <
        //                                 button type = "button"
        //                                 onClick = {
        //                                     () => handleRemoveNewDocument(index) }
        //                                 className = "btn-delete-doc" >
        //                                 Remove <
        //                                 /button> <
        //                                 /li>
        //                             ))
        //                         } <
        //                         /ul>
        //                     )
        //                 } <
        //                 /div> <
        //                 /div>

        //                 <
        //                 div className = "form-actions" >
        //                 <
        //                 button type = "submit"
        //                 className = "btn-primary" > { editMode ? 'Update Organization' : 'Create Organization' } <
        //                 /button> <
        //                 button type = "button"
        //                 onClick = { closeForm }
        //                 className = "btn-secondary" >
        //                 Cancel <
        //                 /button> <
        //                 /div> <
        //                 /form> <
        //                 /div> <
        //                 /div>
        //             )
        //         } <
        //         /div>
        //     );
        // };

       