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
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  setFilters,
  clearFilters,
  deleteOrganizations,
} from "../../../store/slices/organizationSlice";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import OrganizationModal from "./AddOrganizationModal";
import LoadingScreen from "../../../components/common/Loading/Loading";
import AddOrganizationFormModal from "./AddOrganizationModal";
import OrganizationDetails from "./OrganizationDetails";
import CustomLoader from "../../../components/common/Loading/CustomLoader";

const OrganizationManagement = () => {
  const dispatch = useDispatch();
  const { organizations, loading, filters } = useSelector((state) => state.organizations);
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [orgId, setOrgId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [plan, setPlan] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkAction,setShowBulkAction] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    logo: null,
    documents: [],
    planId: "",
    start_date: "",
    end_date: "",
    adminRoleId: "",
  });
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Updated logo:", formData.logo);
  }, [formData.logo]);
  
  useEffect(() => {
    dispatch(fetchOrganizations(filters));
    fetchPlans();
  }, [dispatch, filters]);
  const fetchPlans = async () => {
    const response = await api.get("/api/globalAdmin/getPlans");
    const data = response.data.data;
    setPlans(data);
  }
  const openForm = (org = null) => {
    console.log(org)
    if (org) {
      setEditMode(true);
      setCurrentOrg(org);
      setPlan(plans.find((plan) => plan._id === org.planId));
      setFormData({
        name: org.name || "",
        email: org.email || "",
        status: org.status || "Active",
        logo: org.logo_url || "",
        documents: org.documents || [],
        planId: org.plan || "",
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
      setPlan(null);
      setFormData({
        name: "",
        email: "",
        status: "Active",
        logo: null,
        documents: [],
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
    if (files) {
      if (name === "logo") {
        console.log("Logo file selected:", files[0]);
        setSelectedLogo(files[0]);
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      } else if (name === "documents") {
        console.log("Documents selected:", files);
        setFormData((prev) => ({ ...prev, [name]: files }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(formData)
    if (editMode) {
      dispatch(updateOrganization({ id: currentOrg.uuid, data: formData }));
    } else {
      if(formData.documents.length === 0 || formData.documents === null){
        alert("Please upload at least one document.")
        return;
      }
      if(formData.logo === null){
        alert("Please upload a logo.")
        return;
      }
      if(formData.planId === ""){
        alert("Please select a plan.")
        return;
      }

      
      
      dispatch(createOrganization(formData));
    }
    closeForm();
  };

  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


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

  const handleOpenOrg = (Id) => {
    setOrgId(Id);
    setShowOrgModal(true);
  };
  const handleCloseOrgModal = () => {
    setShowOrgModal(false);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // show 5 surveys per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentpages = organizations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === currentpages.length
        ? []
        : currentpages.map((org) => org.uuid)
    );
  };
  const handleDeleteOrg = (id) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        dispatch(deleteOrganization(id));
      } catch (error) {
        console.error(error);
      }
    }
  }

  const handleBulkDeleteOrg = (ids) => {
    if(ids.length === 0){
      alert("Please select at least one organization to delete.")
      return;
    }
    if (window.confirm("Are you sure you want to delete these organizations?")) {
      try {
        dispatch(deleteOrganizations(ids));
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <>
      <div className="app-container">

        {/* Main Content */}
        <div className="main-content">
          {showOrgModal && (
            <OrganizationDetails
              orgId={orgId}
              isOpen={showOrgModal}
              onClose={handleCloseOrgModal}
            />
          )}

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
                  name="name"
                  placeholder="Search.."
                  className="search-input"
                  onChange={(e) => handleFilterChange(e)}
                />
              </div>

              <div className="controls-right">
                <button className="control-btn" onClick={() => setShowFilters((prev) => !prev)}>
                  <Filter size={16} />
                  Filter
                </button>

                {/* <button className="control-btn">
                  <Share size={16} />
                  Share
                </button> */}
                <button className="control-btn" onClick={() => setShowBulkAction((prev) => !prev)}>
                  Bulk Action <ChevronDown size={16} />
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="filter-panel">
                {/* Status Filter */}
                <div className="filter-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={filters?.status || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Plan Filter */}
                <div className="filter-group">
                  <label>Plan</label>
                  <select
                    name="plan"
                    value={filters?.plan || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-actions">
                  {/* <button className="apply-btn" onClick={() => setShowFilters(false)}>
                    Apply
                  </button> */}
                  <button className="reset-btn" onClick={resetFilters}>
                    Clear
                  </button>
                </div>
              </div>
            )}
            {showBulkAction && (
              <div className="bulk-action-panel">
                {/* Status Filter */}
                <div className="bulk-action-group">
                  {/* <label>Delete</label> */}
                  <button className="bulk-action-delete-btn" onClick={() => handleBulkDeleteOrg(selectedItems)}>
                    Delete
                  </button>
                </div>
              </div>
            )}
            {/* Table */}
            {loading ? <CustomLoader text="Loading Organizations..." /> : 
            <>
            <div className="table-container">
              <div className="table-header">
                <input
                  type="checkbox"
                  checked={currentpages.length > 0 && selectedItems.length === currentpages.length}
                  onChange={handleSelectAll}
                />
                <div>Start Date</div>
                <div>End Date</div>
                <div>Status</div>
                <div>Organization</div>
                <div>Plan Name</div>
                <div>Actions</div>
              </div>

              {currentpages.map((org) => (
                <div key={org.id} className="table-row">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(org.uuid)}
                    onChange={() => handleCheckboxChange(org.uuid)}
                    key={org.uuid}
                  />
                  <div className="date-cell">
                    {new Date(org.start_date).toLocaleDateString("en-CA")}
                  </div>
                  <div className="date-cell">
                    {new Date(org.end_date).toLocaleDateString("en-CA")}
                  </div>

                  <div>
                    <span
                      className={`status-badge ${org.status === "Active"
                        ? "status-paid"
                        : "status-cancelled"
                        }`}
                    >
                      {org.status === "Active" ? "✓ Active" : "✕ Inactive"}
                    </span>
                  </div>

                  <div className="user-cell" onClick={() => handleOpenOrg(org.uuid)}>
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
                      onClick={() => handleDeleteOrg(org.uuid)}
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
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {/* Page Numbers */}
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
            </>}
          </div>
        </div>
      </div>

      {showForm && <AddOrganizationFormModal
        showForm={showForm}
        editMode={editMode}
        formData={formData}
        setFormData={setFormData}
        setSelectedLogo={setSelectedLogo}
        selectedLogo={selectedLogo}
        closeForm={closeForm}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        plans={plans}
        plan={plan}
      />}


    </>
  );
};

export default OrganizationManagement;
