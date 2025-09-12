import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Share,
  ChevronDown,
  Home,
  Users,
  BookOpen,
  Calendar,
  User,
  Clock,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./NewOrgManage.css";
import Notification from "../../../assets/Notification.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  setFilters,
  clearFilters,
} from "../../../store/slices/organizationSlice";
import api from "../../../services/api";

const OrganizationManagement = () => {
  const dispatch = useDispatch();
  const { organizations, loading, filters} = useSelector((state) => state.organizations);
  const [plans,setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    logo: null,
    planId: "",
    start_date: "",
    end_date: "",
    adminRoleId: "",
  });

  useEffect(() => {
    dispatch(fetchOrganizations(filters));
   fetchPlans();
  }, [dispatch,filters]);
  const fetchPlans = async()=>{
    const response = await api.get("/api/globalAdmin/getPlans");
    const data = response.data.data;
    setPlans(data);
  }
  const openForm = (org = null) => {
    if (org) {
      setEditMode(true);
      setCurrentOrg(org);
      setFormData({
        name: org.name || "",
        email: org.email || "",
        status: org.status || "Active",
        logo: null,
        planId: org.planId || "",
        start_date: org.start_date
          ? new Date(org.start_date).toISOString().split("T")[0]
          : "",
        end_date: org.end_date
          ? new Date(org.end_date).toISOString().split("T")[0]
          : "",
        adminRoleId: org.adminRoleId || "",
      });
    } else {
      setEditMode(false);
      setCurrentOrg(null);
      setFormData({
        name: "",
        email: "",
        status: "Active",
        logo: null,
        planId: "",
        start_date: "",
        end_date: "",
        adminRoleId: "",
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentOrg(null);
    setSelectedLogo(null);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    // console.log(name,value);
    
    if (files) {
      setSelectedLogo(files[0]);
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // setLoading(true);
    if (editMode) {
      dispatch(updateOrganization({ id: currentOrg.id, ...formData }));
    } else {
      dispatch(createOrganization(formData));
    }
    closeForm();
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === organizations.length
        ? []
        : organizations.map((org) => org.id)
    );
  };
  const handleFilterChange = (e) => {
      const { name, value } = e.target;
      console.log(name,value)
      dispatch(
        setFilters({
          [name]: value,
        })
      );
    };
  
    const resetFilters = () => {
      dispatch(clearFilters());
    };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentpages = organizations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

  const sidebarItems = [
    { icon: Users, label: "Organizations", active: true },
    { icon: Users, label: "Users" },
    { icon: BookOpen, label: "Projects" },
    { icon: Calendar, label: "Calendar" },
    { icon: User, label: "Profile" },
    { icon: Clock, label: "Activity" },
    { icon: HelpCircle, label: "Help" },
  ];

  return (
    <>
      <div className="app-container">

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          {/* <header className="header">
            <div className="breadcrumbs">
              <Home size={16} />
              <span>/</span>
              <span>Manage Organizations</span>
            </div>

            <div className="user-section">
              <span className="user-name">Kushal Bhabthula</span>
              <ChevronDown size={16} color="#6b7280" />
              <img src={Notification} alt="notification" />
              <div className="user-avatar">K</div>
            </div>
          </header> */}

          {/* Page Content */}
          <div className="page-content">
            <div className="page-header">
              <h1 className="page-title">Organizations</h1>
              <button className="add-btn" onClick={() => openForm()}>
                + Add Organization
              </button>
            </div>

            {/* Controls */}
            <div className="controls">
              <div className="search-container">
                <Search size={16} color="#6b7280" className="search-icon" />
                <input
                  type="text"
                  placeholder="Search"
                  className="search-input"
                  onChange={(e) => handleFilterChange(e)}
                />
              </div>

              <div className="controls-right">
                <button className="control-btn">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="control-btn">
                  <Share size={16} />
                  Share
                </button>
                <button className="control-btn">
                  Bulk Action <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? "Loading..." : <div className="table-container">
              <div className="table-header">
                <input
                  type="checkbox"
                  checked={selectedItems.length === organizations.length}
                  onChange={handleSelectAll}
                />
                <div>Start Date</div>
                <div>End Date</div>
                <div>Status</div>
                <div>Organization</div>
                <div>Plan Name</div>
                <div></div>
              </div>

              {organizations.map((org) => (
                <div key={org.id} className="table-row">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(org._id)}
                    onChange={() => handleCheckboxChange(org._id)}
                  />
                  <div className="date-cell">
                    {new Date(org.start_date).toLocaleDateString("en-CA")}
                  </div>
                  <div className="date-cell">
                    {new Date(org.end_date).toLocaleDateString("en-CA")}
                  </div>

                  <div>
                    <span
                      className={`status-badge ${
                        org.status === "Active"
                          ? "status-paid"
                          : "status-cancelled"
                      }`}
                    >
                      {org.status === "Active" ? "✓ Active" : "✕ Inactive"}
                    </span>
                  </div>

                  <div className="user-cell">
                    <div
                      className="user-avatar-cell"
                      style={{ backgroundColor: "#FFC107" }}
                    >
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        org?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="user-info">
                      <div className="user-name-cell">{org.name}</div>
                      <div className="user-email">{org.email}</div>
                    </div>
                  </div>

                  <div className="purchase-cell">{org.planName}</div>

                  <div className="actions-cell">
                    <button
                      className="action-btn delete-btn"
                      onClick={() => dispatch(deleteOrganization(org.id))}
                    >
                      Delete
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openForm(org)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div> }

            {/* Pagination */}
            <div className="pagination">
              <button className="pagination-btn">
                <ChevronLeft size={16} /> Previous
              </button>
              <div className="pagination-numbers">
                {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
                  <button
                    key={index}
                    className={`page-btn ${page === 1 ? "active" : ""}`}
                    disabled={page === "..."}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="pagination-btn">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

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
        {/* Row 1 */}
        <div className="form-row">
          <div className="form-group">
            <label>Organization Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
          <div className="form-group">
            <label>Logo</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleInputChange}
            />
            {selectedLogo && (
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="btn-secondary"
              >
                Preview
              </button>
            )}
            {!selectedLogo && editMode && currentOrg?.logo_url && (
              <img
                src={currentOrg.logo_url}
                alt="Current Logo"
                className="logo-preview-small"
              />
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
            <label htmlFor="document">Document</label>
                <input type="file" name="documents" id="document" onChange={handleInputChange} multiple />
            </div>
            
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Plan *</label>
            <select
              name="planId"
              value={formData.planId}
              onChange={handleInputChange}
            >
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 - Dates */}
        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>End Date *</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editMode ? "Update" : "Create"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={closeForm}
          >
            Cancel
          </button>
        </div>
      </form>

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
              alt="Preview"
              className="preview-image"
            />
          </div>
        </div>
      )}
    </div>
  </div>
)}


    </>
  );
};

export default OrganizationManagement;
