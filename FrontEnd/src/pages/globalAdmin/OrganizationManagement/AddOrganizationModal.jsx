import React, { useEffect, useState } from "react";
import "./AddOrganizationModal.css";
import FeaturedIcon from "../../../assets/Featured icon.svg";
import AddOrgDateRangePickerSingle from "../../../components/common/CustomDatePicker/DateRangePicker";
import { GoOrganization, GoUpload, GoX, GoTrash, GoEye } from "react-icons/go";
import CustomError from "../../../components/common/Error/Error";

const DOCUMENT_FIELDS = [
  { key: "invoice", label: "Invoice" },
  { key: "receipt", label: "Receipt" },
  { key: "document3", label: "Document 3" },
  { key: "document4", label: "Document 4" }
];

const AddOrganizationModal = ({
  showForm,
  editMode,
  formData,
  setFormData,
  setSelectedLogo,
  selectedLogo,
  closeForm,
  handleInputChange,
  handleSubmit,
  plans,
  loading,
  error
}) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [showLogoPreview, setShowLogoPreview] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  // console.log(formData)
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      setDateRange([new Date(formData.start_date), new Date(formData.end_date)]);
    }
  }, [formData.start_date, formData.end_date]);

  useEffect(() => {
    if (dateRange[0] && dateRange[1]) {
      setFormData((prev) => ({
        ...prev,
        start_date: dateRange[0].toISOString().split("T")[0],
        end_date: dateRange[1].toISOString().split("T")[0],
      }));
    }
  }, [dateRange, setFormData]);
  if (!showForm) return null;


  const openDocumentPreview = (file) => {
    // console.log(file)
    const url = URL.createObjectURL(file);
    setDocPreviewUrl(url);
  };


  const closeDocumentPreview = () => {
    if (docPreviewUrl) {
      URL.revokeObjectURL(docPreviewUrl);
      setDocPreviewUrl(null);
    }
  };

  // Logo handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setSelectedLogo(file);
    setFormData((prev) => ({ ...prev, logo: file }));
    if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    setLogoPreviewUrl(file ? URL.createObjectURL(file) : null);
    e.target.value = null;
  };

  const removeLogo = () => {
    setSelectedLogo(null);
    setFormData((prev) => ({ ...prev, logo: null }));
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
  };

  // Document handlers
  const handleDocumentChange = (key) => (e) => {
    const file = e.target.files[0] || null;
    setFormData((prev) => ({ ...prev, [key]: file }));
    e.target.value = null;
  };

  const removeDocument = (key) => {
    setFormData((prev) => ({ ...prev, [key]: null }));
  };

  const viewDocument = (file) => {
    if (file) {
      const url = typeof file === "string" ? file : URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };

  const logoToPreview = selectedLogo || formData.logo;

  const handleDragOver = (e, fieldName) => {
    e.preventDefault();
    setDragOver(fieldName);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    setDragOver(null);
    // Handle file drop logic here
  };

  return (
    <div className="addOrg-modal-overlay">
      <div className="addOrg-modal-content">
        {/* Header with close button */}
        <div className="addOrg-modal-header">
          <div className="addOrg-header-content">
            <div className="addOrg-header-icon">
              <GoOrganization size={24} color="#5570f1" />
            </div>
            <div>
              <h2>{editMode ? "Edit Organization" : "Add New Organization"}</h2>
              <p className="addOrg-header-subtitle">
                {editMode ? "Update organization details" : "Create a new organization profile"}
              </p>
              {error && <CustomError  error={error} />}
            </div>
          </div>
          <button 
            type="button" 
            className="addOrg-close-btn"
            onClick={closeForm}
            aria-label="Close modal"
          >
            <GoX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="addOrg-org-form">
          {/* Basic Information Section */}
          <div className="addOrg-form-section">
            <h3 className="addOrg-section-title" style={{marginTop:"10px"}}>Basic Information</h3>
            <div className="addOrg-form-grid">
              <div className="addOrg-form-group">
                <label className="addOrg-form-label">
                  Company Name<span className="addOrg-required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="addOrg-form-input"
                  required
                />
              </div>
              
              <div className="addOrg-form-group">
                <label className="addOrg-form-label">
                  Contact Email<span className="addOrg-required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Contact@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="addOrg-form-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Plan & Role Section */}
          <div className="addOrg-form-section">
            <h3 className="addOrg-section-title">Plan & Access</h3>
            <div className="addOrg-form-grid">
              <div className="addOrg-form-group">
                <label className="addOrg-form-label">
                  Subscription Plan<span className="addOrg-required">*</span>
                </label>
                <select
                  name="planId"
                  value={formData.planId}
                  onChange={handleInputChange}
                  className="addOrg-form-select"
                  required
                >
                  <option value="">Choose a plan</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="addOrg-form-group">
                <label className="addOrg-form-label">
                  Administrator Role<span className="addOrg-required">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role || "Admin"}
                  onChange={handleInputChange}
                  className="addOrg-form-select"
                  required
                >
                  <option value="Admin">Administrator</option>
                  <option value="SuperAdmin">Super Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscription Period Section */}
          <div className="addOrg-form-section">
            <h3 className="addOrg-section-title">Subscription Period</h3>
            <div className="addOrg-form-grid">
              <div className="addOrg-form-group">
                <label className="addOrg-form-label">Start Date</label>
                <button
                  type="button"
                  onClick={() => setOpenStart(true)}
                  className="addOrg-date-btn"
                >
                  <span>
                    {dateRange[0]
                      ? dateRange[0].toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "Select start date"}
                  </span>
                </button>
              </div>
              
              <div className="addOrg-form-group">
                <label className="addOrg-form-label">End Date</label>
                <button
                  type="button"
                  onClick={() => setOpenEnd(true)}
                  className={`addOrg-date-btn ${!dateRange[0] ? 'addOrg-date-btn-disabled' : ''}`}
                  disabled={!dateRange[0]}
                >
                  <span>
                    {dateRange[1]
                      ? dateRange[1].toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : "Select end date"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* File Uploads Section */}
          <div className="addOrg-form-section">
            <h3 className="addOrg-section-title">Required Documents</h3>
            
            {/* Logo Upload - Inline */}
            <div className="addOrg-inline-upload-row">
              <div className="addOrg-upload-info">
                <label className="addOrg-form-label">
                  Company Logo<span className="addOrg-required">*</span>
                </label>
                <p className="addOrg-upload-desc">Upload your company logo (PNG, JPG  )</p>
              </div>
              <div className="addOrg-upload-container">
                {logoToPreview ? (
                  <div className="addOrg-file-preview">
                    <div className="addOrg-preview-content">
                      <div className="addOrg-file-info">
                        <span className="addOrg-file-name">
                          {typeof logoToPreview === 'string' ? 'Current Logo' : logoToPreview.name}
                        </span>
                      </div>
                    </div>
                    <div className="addOrg-file-actions">
                      <button 
                        type="button" 
                        onClick={() => setShowLogoPreview(true)}
                        className="addOrg-action-btn addOrg-view-btn"
                        title="View"
                      >
                        <GoEye size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={removeLogo}
                        className="addOrg-action-btn addOrg-remove-btn"
                        title="Remove"
                      >
                        <GoTrash size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`addOrg-inline-upload-zone ${dragOver === 'logo' ? 'addOrg-drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 'logo')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => { handleDrop(e, 'logo') }}
                  >
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      className="addOrg-file-input"
                      id="logo-upload"
                      onChange={handleLogoUpload}
                      required={!editMode}
                    />
                    <label htmlFor="logo-upload" className="addOrg-upload-label">
                      <GoUpload size={16} />
                      <span>Choose File</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            {/* Document Uploads - Inline per named field */}
            {DOCUMENT_FIELDS.map(({key, label}, idx) => (
              <div className="addOrg-inline-upload-row" key={key}>
                <div className="addOrg-upload-info">
                  <label className="addOrg-form-label">
                    {label}
                    <span className="addOrg-required">*</span>
                  </label>
                  <p className="addOrg-upload-desc">
                    {key === "invoice"
                      ? "Upload invoice document (PDF). Required."
                      : key === "receipt"
                        ? "Upload payment receipt document (PDF). Required."
                        : "Additional document"}
                  </p>
                </div>
                <div className="addOrg-upload-container">
                  {formData[key] ? (
                    <div className="addOrg-file-preview">
                      <div className="addOrg-preview-content">
                        <div className="addOrg-file-info">
                          <span className="addOrg-file-name">
                            {formData[key].name}
                          </span>
                          <span className="addOrg-file-size">
                            {formData[key].size
                              ? `${(formData[key].size / 1024).toFixed(1)} KB`
                              : ''}
                          </span>
                        </div>
                      </div>
                      <div className="addOrg-file-actions">
                        <button 
                          type="button" 
                          onClick={() => viewDocument(formData[key])}
                          className="addOrg-action-btn addOrg-view-btn"
                          title="View"
                        >
                          <GoEye size={14} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeDocument(key)}
                          className="addOrg-action-btn addOrg-remove-btn"
                          title="Remove"
                        >
                          <GoTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`addOrg-inline-upload-zone ${dragOver === key ? 'addOrg-drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => { handleDrop(e, key) }}
                    >
                      <input 
                        type="file" 
                        className="addOrg-file-input"
                        accept="application/pdf"
                        id={`doc-upload-${key}`}
                        onChange={handleDocumentChange(key)}
                        required={!editMode}
                      />
                      <label htmlFor={`doc-upload-${key}`} className="addOrg-upload-label">
                        <GoUpload size={16} />
                        <span>Choose File</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="addOrg-form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeForm}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <GoOrganization size={16} />
              <span>{loading ? 'Processing...' : (editMode ? "Update Organization" : "Create Organization")}</span>
            </button>
          </div>
        </form>

        {/* Date Pickers */}
        {openStart && (
          <AddOrgDateRangePickerSingle
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClose={() => setOpenStart(false)}
            selectStart={true}
            onDateChange={(date) => {
              setDateRange([date, dateRange[1]]);
              setOpenStart(false);
            }}
            title="Select Start Date"
          />
        )}
        {openEnd && (
          <AddOrgDateRangePickerSingle
            dateRange={dateRange}
            setDateRange={setDateRange}
            onClose={() => setOpenEnd(false)}
            selectStart={false}
            onDateChange={(date) => {
              setDateRange([dateRange[0], date]);
              setOpenEnd(false);
            }}
            isEndDate={true}
            startDate={dateRange[0]}
            title="Select End Date"
          />
        )}

        {/* Logo Preview Modal */}
        {showLogoPreview && logoToPreview && (
          <div className="addOrg-preview-modal" onClick={() => setShowLogoPreview(false)}>
            <div className="addOrg-preview-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="addOrg-preview-close"
                onClick={() => setShowLogoPreview(false)}
              >
                <GoX size={20} />
              </button>
              <img 
                src={typeof logoToPreview === 'string' ? logoToPreview : URL.createObjectURL(logoToPreview)}
                alt="Logo preview"
                className="addOrg-preview-image"
              />
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {docPreviewUrl && (
          <div className="addOrg-preview-modal" onClick={closeDocumentPreview}>
            <div className="addOrg-preview-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="addOrg-preview-close"
                onClick={closeDocumentPreview}
              >
                <GoX size={20} />
              </button>
              <iframe 
                src={docPreviewUrl}
                className="addOrg-preview-document"
                title="Document preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddOrganizationModal;