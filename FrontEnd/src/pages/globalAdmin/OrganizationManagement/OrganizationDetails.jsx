import React, { useEffect, useState } from "react";
import "./OrganizationDetails.css";
import { fetchOrganizationById } from "../../../store/slices/organizationSlice";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";
import CustomLoader from "../../../components/common/Loading/CustomLoader";

const OrganizationDetails = ({ orgId, isOpen, onClose }) => {
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);
  const dispatch = useDispatch();

    // console.log(orgId)
    useEffect(() => {
        if (isOpen && orgId) {
          dispatch(fetchOrganizationById(orgId));
        }
      }, [dispatch, orgId, isOpen]);
  const { currentOrganization, loading, error } = useSelector(
    (state) => state.organizations
  );

 

  if (!isOpen) return null;

  if (loading) {
    return ReactDOM.createPortal(
      <CustomLoader text="Loading Organization Data..." />,
      document.body
    );
  }

  if (!currentOrganization) {
    return ReactDOM.createPortal(
      <div className="org-modal-overlay">
        <div className="org-modal">
          <p>No organization data available.</p>
          <button onClick={onClose} className="org-close-btn">Close</button>
        </div>
      </div>,
      document.body
    );
  }

  const { name, email, planName, role, start_date, end_date, logo_url, documents } =
    currentOrganization;

  const openDocumentPreview = (doc) => {
    const url = typeof doc === "string" ? doc : URL.createObjectURL(doc);
    setDocPreviewUrl(url);
  };

  const closeDocumentPreview = () => {
    if (docPreviewUrl) {
      URL.revokeObjectURL(docPreviewUrl);
      setDocPreviewUrl(null);
    }
  };

  return ReactDOM.createPortal(
    <div className="org-modal-overlay" onClick={onClose}>
      <div
        className="org-modal"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
      >
        {/* Close Button */}
        <button className="org-close-btn" onClick={onClose}>
          &times;
        </button>

        {/* Header */}
        <div className="org-details-header">
          <h2>{name}</h2>
          <p>{email}</p>
        </div>

        {/* Logo */}
        {logo_url && (
          <div className="org-details-section">
            <h3>Organization Logo</h3>
            <img
              src={typeof logo_url === "string" ? logo_url : URL.createObjectURL(logo_url)}
              alt="Organization Logo"
              className="org-details-logo"
            />
          </div>
        )}

        {/* Info */}
        <div className="org-details-section">
          <h3>Organization Information</h3>
          <ul>
            <li>
              <strong>Plan:</strong> {planName || "N/A"}
            </li>
            <li>
              <strong>Role:</strong> {role}
            </li>
            <li>
              <strong>Start Date:</strong> {new Date(start_date).toLocaleDateString("en-US")}
            </li>
            <li>
              <strong>End Date:</strong> {new Date(end_date).toLocaleDateString("en-US")}
            </li>
          </ul>
        </div>

        {/* Documents */}
        {documents && documents.length > 0 && (
          <div className="org-details-section">
            <h3>Uploaded Documents</h3>
            <div className="org-details-documents">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="org-doc-icon"
                  onClick={() => openDocumentPreview(doc)}
                  title={doc.name || `Document ${idx + 1}`}
                >
                  📄
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Preview */}
        {docPreviewUrl && (
          <div
            className="org-doc-preview-overlay"
            onClick={closeDocumentPreview}
          >
            <div
              className="org-doc-preview-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="org-doc-close-btn"
                onClick={closeDocumentPreview}
              >
                &times;
              </button>
              <iframe
                src={docPreviewUrl}
                title="Document Preview"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default OrganizationDetails;
