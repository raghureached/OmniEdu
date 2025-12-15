import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Edit3,
  Trash2,
} from "lucide-react";
import { RiDeleteBinFill } from "react-icons/ri";
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
import AddOrganizationFormModal from "./AddOrganizationModal";
import OrganizationDetails from "./OrganizationDetails";
import './OrganizationManagement.css'
import LoadingScreen from "../../../components/common/Loading/Loading";
import { GoX } from "react-icons/go";
import {useNotification} from "../../../components/common/Notification/NotificationProvider"
import { notifyError, notifySuccess } from "../../../utils/notification";
import { useConfirm } from "../../../components/ConfirmDialogue/ConfirmDialog";

const OrganizationManagement = () => {
  const dispatch = useDispatch();
  const { organizations, loading, filters, error,creating,updating,deleting } = useSelector((state) => state.organizations);  
  const [plans, setPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [org, setOrg] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [plan, setPlan] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({});
  const {showNotification} = useNotification()
  const [showBulkAction, setShowBulkAction] = useState(false)
  const {confirm} = useConfirm()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    logo: null,
    invoice: "",
    receipt: "",
    document3: "",
    document4: "",
    planId: "",
    start_date: "",
    end_date: "",
    adminRoleId: "",
  });
  // Fetch organizations whenever any filter changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchOrganizations(filters));
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [dispatch, filters]);

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const response = await api.get("/api/globalAdmin/getPlans");
    const data = response.data.data;
    setPlans(data);
  }
  const openForm = (org = null) => {
    // console.log(org)
    if (org) {
      setEditMode(true);
      setCurrentOrg(org);
      setPlan(plans.find((plan) => plan._id === org.planId));
      setFormData({
        name: org.name || "",
        email: org.email || "",
        status: org.status || "Active",
        logo: org.logo_url || "",
        invoice: org.invoice_url || "",
        receipt: org.receipt_url || "",
        document3: org.document3 || "",
        document4: org.document4 || "",
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
        invoice: "",
        receipt: "",
        document3: "",
        document4: "",
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
        // console.log("Logo file selected:", files[0]);
        setSelectedLogo(files[0]);
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      } else if (name === "documents") {
        // console.log("Documents selected:", files);
        setFormData((prev) => ({ ...prev, [name]: files }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // console.log(formData);

    if (editMode) {
      try {
        const resultAction = await dispatch(updateOrganization({ id: currentOrg.uuid, data: formData }));
        if (updateOrganization.fulfilled.match(resultAction)) {

          closeForm();
          showNotification({
            type: 'success',
            title: 'Organization updated successfully',
            message: 'Organization updated successfully',
            duration: 5000,
            dismissible: true,
          });
        } else {
          // Handle errors here (optional)
          showNotification({
            type: 'error',
            title: 'Failed to update organization',
            message: resultAction.payload?.message || 'Failed to update organization',
            duration: 5000,
            dismissible: true,
          });
          // alert(resultAction.payload?.message || 'Failed to update organization');
        }
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Failed to update organization',
          message: error || 'Failed to update organization',
          duration: 5000,
          dismissible: true,
        });
        // alert('Failed to update organization');
      }
    } else {
      if (!formData.invoice || !formData.receipt) {
        alert("Please upload invoice and receipt.");
        return;
      }
      if (!formData.logo) {
        alert("Please upload a logo.");
        return;
      }
      if (!formData.planId) {
        alert("Please select a plan.");
        return;
      }
      try {
        const resultAction = await dispatch(createOrganization(formData));
        
        if (createOrganization.fulfilled.match(resultAction)) {
          closeForm();
          showNotification({
            type: 'success',
            title: 'Organization created successfully',
            message: 'Organization created successfully',
            duration: 5000,
            dismissible: true,
          });
        } else {
          showNotification({
            type: 'error',
            title: 'Failed to create organization',
            message: resultAction.payload?.message || 'Failed to create organization',
            duration: 5000,
            dismissible: true,
          });
          // alert(resultAction.payload?.message || 'Failed to create organization');
        }
      } catch (error) {
        showNotification({
          type: 'error',
          title: 'Failed to create organization',
          message: error.message || 'Failed to create organization',
          duration: 5000,
          dismissible: true,
        });
        // alert('Failed to create organization');
      }
    }
  };


  const handleCheckboxChange = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(tempFilters));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    dispatch(clearFilters());
    setShowFilters(false);
  };
  const getStatus = (org) => {
    const today = new Date();
    const endDate = new Date(org.end_date);
    if (endDate < today) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  
  const handleOpenOrg = (org) => {
    setOrg(org);
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
  const handleDeleteOrg = async (id) => {
    const confirmed = await confirm({
      title: `Are you sure you want to delete this Organization?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated items will be removed.',
    });
    if (confirmed) {
      try {
        const resultAction = await dispatch(deleteOrganization(id));
        if(deleteOrganization.fulfilled.match(resultAction)){
          notifySuccess('Organization deleted successfully', {
            duration: 5000,
            dismissible: true,
            title: 'Organization deleted successfully',
          });
        }else{
          notifyError(resultAction.payload?.message || 'Failed to delete organization', {
            duration: 5000,
            dismissible: true,
            title: 'Failed to delete organization',
            dismissible: true,
          });
        }
      } catch (error) {
        notifyError(error.message || 'Failed to delete organization', {
          duration: 5000,
          dismissible: true,
          title: 'Failed to delete organization',
        });
      }
    }
  }

  const handleBulkDeleteOrg = async (ids) => {
    if (ids.length === 0) {
      alert("Please select at least one organization to delete.")
      return;
    }
    const confirmed = await confirm({
      title: `Are you sure you want to delete these organizations?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger', // or 'warning', 'info'
      showCheckbox: true,
      checkboxLabel: 'I understand that the data cannot be retrieved after deleting.',
      note: 'Associated items will be removed.',
    });
    if (confirmed) {
      try {
        const resultAction = await dispatch(deleteOrganizations(ids));
        if(deleteOrganizations.fulfilled.match(resultAction)){
          // showNotification({
          //   type: 'success',
          notifySuccess('Organizations deleted successfully', {
            duration: 5000,
            dismissible: true,
            title: 'Organizations deleted successfully',
          });
        }else{
          notifyError(resultAction.payload?.message || 'Failed to delete organizations', {
            duration: 5000,
            dismissible: true,
            title: 'Failed to delete organizations',
          });
        }
      } catch (error) {
        notifyError(error.message || 'Failed to delete organizations', {
          duration: 5000,
          dismissible: true,
          title: 'Failed to delete organizations',
        });
      }
    }
    setShowBulkAction(false);
    setSelectedItems([]);
  }

  return (
    <>
    {deleting && <LoadingScreen text="Deleting Organization..." />}
      {loading && filters.name === "" ? <LoadingScreen text="Loading Organizations..." /> : (
        <div className="app-container">
          {/* Main Content */}
          <div className="main-content">
            {showOrgModal && (
              <OrganizationDetails
                org={org}
                isOpen={showOrgModal}
                onClose={handleCloseOrgModal}
              />
            )}

            {/* Page Content */}
            <div className="page-content">

              {/* Controls */}
              <div className="controls">
                <div className="roles-search-bar">
                  <Search size={16} color="#6b7280" className="search-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Search"
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
                  <button className="btn-primary" onClick={() => openForm()}>
                    + Add Organization
                  </button>
                </div>
              </div>
              {showFilters && (
                <div className="filter-panel">
                  <span style={{ cursor: "pointer", position: "absolute", right: "10px", top: "10px",hover:{color:"#6b7280"}}} onClick={() => setShowFilters(false)}><GoX size={20} color="#6b7280" /></span>
                  <div className="filter-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={tempFilters?.status || filters?.status || ""}
                      onChange={handleFilterChange}
                    >
                      <option value="">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Plan Filter */}
                  <div className="filter-group">
                    <label>Plan</label>
                    <select
                      name="plan"
                      value={tempFilters?.plan || filters?.plan || ""}
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
                    <button className="btn-secondary"  onClick={handleClearFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                      Clear
                    </button>
                    <button className="btn-primary"  onClick={handleApplyFilters} style={{ padding: '6px 12px', fontSize: '14px' }}>
                      Apply
                    </button>
                  </div>
                </div>
              )}
              {showBulkAction && (
                <div className="bulk-action-panel">
                  <div className="bulk-action-header">
                    <label className="bulk-action-title">Items Selected: {selectedItems.length}</label>
                    <GoX
                      size={20}
                      title="Close"
                      aria-label="Close bulk action panel"
                      onClick={() => setShowBulkAction(false)}
                      className="bulk-action-close"
                    />
                  </div>
                  <div className="bulk-action-actions">
                    <button
                      className="bulk-action-delete-btn"
                      disabled={selectedItems.length === 0}
                      onClick={() => handleBulkDeleteOrg(selectedItems)}
                    >
                      <RiDeleteBinFill size={16} color="#fff" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
              <>
                <div className="table-container">
                  <div className="table-header">
                    <input
                      type="checkbox"
                      checked={currentpages.length > 0 && selectedItems.length === currentpages.length}
                      onChange={handleSelectAll}
                    />
                    <div>Plan ID</div>
                    <div>Organization</div>
                    <div>Start Date</div>
                    <div>End Date</div>
                    <div>Status</div>
                    <div>Plan Name</div>
                    <div>Actions</div>
                  </div>

                  {currentpages.map((org) => (
                    <div key={org.id} className={`table-row`}>
                      {/* <span style={{color: "#FF0000", fontWeight: "bold",position: "absolute", left: "0", top: "0"}}>Expired</span> */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(org.uuid)}
                        onChange={() => handleCheckboxChange(org.uuid)}
                        key={org.uuid}
                      />
                      <div className="planId">{org.planId}</div>
                      <div className="user-cell" onClick={() => handleOpenOrg(org)}>
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
                      <div className="purchase-cell" style={{ textTransform: "capitalize" }}>{org.planName}</div>

                      <div className="actions-cell">
                        <button
                          className="global-action-btn edit"
                          onClick={() => openForm(org)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="global-action-btn delete"
                          onClick={() => handleDeleteOrg(org.uuid)}
                        >
                          <Trash2 size={16} />
                        </button>
                        
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination - aligned with Module Management */}
                <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Prev
                    </button>
                    <span style={{ color: '#0f172a' }}>
                      {`Page ${currentPage} of ${Math.max(1, totalPages)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', color: '#0f172a', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>)}

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
        loading={loading}
        error={error}
        creating={creating}
        updating={updating}
        deleting={deleting}
      />}

    </>
  );
};

export default OrganizationManagement;
