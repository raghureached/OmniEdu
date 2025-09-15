import React, { useEffect, useState } from "react";
import "./AddOrganizationModal.css";
import FeaturedIcon from "../../../assets/Featured icon.svg";
import AddOrgDateRangePickerSingle from "./DateRangePicker";

const OrganizationFormModal = ({
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
}) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [showLogoPreview, setShowLogoPreview] = useState(false);
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);
  const [documents, setDocuments] = useState([]); // local state for docs

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

  useEffect(() => {
    if (formData.documents) {
      setDocuments(Array.from(formData.documents));
    }
  }, [formData.documents]);

  if (!showForm) return null;

  const openDocumentPreview = (file) => {
    const url = URL.createObjectURL(file);
    setDocPreviewUrl(url);
  };

  const closeDocumentPreview = () => {
    if (docPreviewUrl) {
      URL.revokeObjectURL(docPreviewUrl);
      setDocPreviewUrl(null);
    }
  };

  const handleDocumentsChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedDocs = [...documents, ...files];
    setDocuments(updatedDocs);
    setFormData((prev) => ({ ...prev, documents: updatedDocs }));
  };

  const handleRemoveDocument = (index) => {
    const updatedDocs = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocs);
    setFormData((prev) => ({ ...prev, documents: updatedDocs }));
  };

  return (
    <div className="addOrg-modal-overlay">
      <div className="addOrg-modal-content">
        <button onClick={closeForm} className="addOrg-close-btn">&times;</button>

        {/* Header */}
        <div className="addOrg-modal-header">
          <span className="addOrg-modal-icon">
            <img src={FeaturedIcon} alt="Featured" />
          </span>
          <h2>{editMode ? "Edit Organization" : "Add Organization"}</h2>
          <p className="addOrg-modal-desc">
            {editMode ? "Edit Organization details" : "Enter Organization details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="addOrg-org-form">
          {/* Company + Email */}
          <div className="addOrg-form-row">
            <div className="addOrg-form-group">
              <label>
                Company<span className="addOrg-required">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="addOrg-form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="email"
                placeholder="Mail ID"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Plan + Role */}
          <div className="addOrg-form-row">
            <div className="addOrg-form-group">
              <label>
                Plan type<span className="addOrg-required">*</span>
              </label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select plan</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="addOrg-form-group">
              <label>
                Assign Role<span className="addOrg-required">*</span>
              </label>
              <select
                name="role"
                value={formData.role || "Admin"}
                onChange={handleInputChange}
                required
              >
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Start + End Dates */}
          <div className="addOrg-form-row">
            <div className="addOrg-form-group">
              <label>
                Start Date<span className="addOrg-required">*</span>
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenStart(true);
                }}
                className="addOrg-btn-secondary"
              >
                {dateRange[0] ? dateRange[0].toLocaleDateString() : "Select Start Date"}
              </button>
            </div>

            <div className="addOrg-form-group">
              <label>
                End Date<span className="addOrg-required">*</span>
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenEnd(true);
                }}
                className="addOrg-btn-secondary"
                disabled={!dateRange[0]}
                style={{
                  opacity: !dateRange[0] ? 0.5 : 1,
                  cursor: !dateRange[0] ? "not-allowed" : "pointer",
                }}
              >
                {dateRange[1] ? dateRange[1].toLocaleDateString() : "Select End Date"}
              </button>
              {!dateRange[0] && (
                <small style={{ color: "#B7B7B7", fontSize: "12px", marginTop: "4px", display: "block" }}>
                  Please select start date first
                </small>
              )}
            </div>
          </div>

          {/* Logo + Documents Upload Row */}
          <div className="addOrg-form-row" style={{ gap: '24px' }}>
            {/* Logo Upload */}
            <div className="addOrg-form-group" style={{ flex: 1, minWidth: 0 }}>
              <label>
                Upload Logo<span className="addOrg-required">*</span>
              </label>
              <div className="addOrg-upload-box">
                <input
                  type="file"
                  id="logo-upload"
                  name="logo"
                  accept="image/svg+xml,image/png,image/jpeg,image/gif"
                  onChange={(e) => {
                    handleInputChange(e);
                    e.target.value = null;
                  }}
                  required={!editMode}
                />
                {selectedLogo ? "" : <label htmlFor="logo-upload" className="addOrg-upload-label">
                  Click to upload <span>or drag and drop</span>
                  <div className="addOrg-upload-formats">
                    SVG, PNG, JPG or GIF (max. 800×400px)
                  </div>
                </label>}
                {selectedLogo && (
                  <div style={{ position: 'absolute', marginTop: 10, display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowLogoPreview(true)}
                      className="addOrg-btn-secondary addOrg-preview-btn"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLogo(null);
                        setFormData((prev) => ({ ...prev, logo: null }));
                      }}
                      className="addOrg-btn-secondary"
                      style={{ backgroundColor: '#f44336', color: '#fff' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Upload */}
            <div className="addOrg-form-group" style={{ flex: 1, minWidth: 0 }}>
              <label>Upload Documents<span className="addOrg-required">*</span></label>
              <div className="addOrg-upload-box">
                <input
                  type="file"
                  id="documents-upload"
                  name="documents"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  multiple
                  onChange={(e) => {
                    handleDocumentsChange(e);
                    e.target.value = null;
                  }}
                />
                <label htmlFor="documents-upload" className="addOrg-upload-label" 
                  style={
                    documents.length !== 0
                      ? { color:"gray",opacity:"60%"} // when empty
                      : {}
                  }>
                  Click to upload <span>or drag and drop</span>
                  <div className="addOrg-upload-formats">
                    PDF, DOC, PPT, XLS formats allowed
                  </div>
                </label>

                {/* Document icons preview */}
                <div className="document-icons-list">
                  {documents.map((file, idx) => (
                    <div
                      key={idx}
                      className="document-icon"
                      title={file.name}
                    >
                      <span onClick={() => openDocumentPreview(file)}>📄</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(idx)}
                        className="remove-doc-btn"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="addOrg-form-actions">
            <button type="button" className="addOrg-btn-secondary" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="addOrg-btn-primary">
              {editMode ? "Update Organization" : "Create Organization"}
            </button>
          </div>
        </form>
      </div>

      {/* Logo image preview modal */}
      {showLogoPreview && selectedLogo && (
        <div className="addOrg-preview-overlay" onClick={() => setShowLogoPreview(false)}>
          <div className="addOrg-preview-content" onClick={e => e.stopPropagation()}>
            <button className="addOrg-close-preview" onClick={() => setShowLogoPreview(false)}>&times;</button>
            <img
              src={URL.createObjectURL(selectedLogo)}
              alt="Logo Preview"
              className="addOrg-preview-image"
            />
          </div>
        </div>
      )}

      {/* Document preview modal */}
      {docPreviewUrl && (
        <div className="addOrg-preview-overlay" onClick={closeDocumentPreview}>
          <div className="addOrg-preview-content" style={{ width: '80vw', height: '80vh' }} onClick={e => e.stopPropagation()}>
            <button className="addOrg-close-preview" onClick={closeDocumentPreview}>&times;</button>
            <iframe
              src={docPreviewUrl}
              title="Document Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Date Pickers */}
      {openStart && (
        <AddOrgDateRangePickerSingle
          selectedDate={dateRange[0]}
          onDateChange={(date) => {
            setDateRange([date, dateRange[1]]);
            setOpenStart(false);
          }}
          onClose={() => setOpenStart(false)}
          isEndDate={false}
          title="Select Start Date"
        />
      )}
      {openEnd && dateRange[0] && (
        <AddOrgDateRangePickerSingle
          selectedDate={dateRange[1]}
          onDateChange={(date) => {
            setDateRange([dateRange[0], date]);
            setOpenEnd(false);
          }}
          onClose={() => setOpenEnd(false)}
          isEndDate={true}
          startDate={dateRange[0]}
          title="Select End Date"
        />
      )}
    </div>
  );
};

export default OrganizationFormModal;
