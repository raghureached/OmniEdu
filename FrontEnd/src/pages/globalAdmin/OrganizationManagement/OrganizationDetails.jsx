import React, { useEffect, useState } from "react";
import "./OrganizationDetails.css";
import ReactDOM from "react-dom";
import CustomLoader from "../../../components/common/Loading/CustomLoader";

const OrganizationDetails = ({ org, isOpen, onClose }) => {
  const [docPreviewUrl, setDocPreviewUrl] = useState(null);

  const currentOrganization = org;
  console.log(org)
  if (!isOpen) return null;

  if (!currentOrganization) {
    return ReactDOM.createPortal(
      <div className="orgDetail-modal-overlay">
        <div className="orgDetail-modal">
          <p>No organization data available.</p>
          <button onClick={onClose} className="orgDetail-close-btn">Close</button>
        </div>
      </div>,
      document.body
    );
  }
  const {
    name,
    email,
    planName,
    receipt_url,
    invoice_url,
    document4,
    document3,
    start_date,
    end_date,
    logo_url,
    planId
  } = currentOrganization;
  const documents = [{
    name: "Receipt",
    url: receipt_url
  }, {
    name: "Invoice",
    url: invoice_url
  }, {
    name: "Document 3",
    url: document3
  }, {
    name: "Document 4",
    url: document4
  }];
  const openDocumentPreview = (doc) => {
    if (docPreviewUrl && !docPreviewUrl.startsWith('http')) {
      URL.revokeObjectURL(docPreviewUrl);
    }
    const url = typeof doc === "string" ? doc : URL.createObjectURL(doc);
    window.open(url, "_blank");
  };

  const closeDocumentPreview = () => {
    if (docPreviewUrl) {
      if (!docPreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(docPreviewUrl);
      }
      setDocPreviewUrl(null);
    }
  };

  return ReactDOM.createPortal(
    <div className="orgDetail-modal-overlay" onClick={onClose}>
      <div
        className="orgDetail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="orgDetail-close-btn" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="orgDetail-header">
          <h2>{name}</h2>
          <p>{email}</p>
        </div>

        {/* Logo */}
        {logo_url && (
          <div className="orgDetail-section">
            <h3>Organization Logo</h3>
            <img
              src={typeof logo_url === "string" ? logo_url : URL.createObjectURL(logo_url)}
              alt="Organization Logo"
              className="orgDetail-logo"
            />
          </div>
        )}

        {/* Info */}
        <div className="orgDetail-section">
          <h3>Organization Information</h3>
          <ul>
            <li><strong>Plan:</strong> {planName || "N/A"}</li>
            <li><strong>Plan ID:</strong> {planId}</li>
            <li><strong>Start Date:</strong> {new Date(start_date).toLocaleDateString("en-US")}</li>
            <li><strong>End Date:</strong> {new Date(end_date).toLocaleDateString("en-US")}</li>
          </ul>
        </div>

        {/* Documents */}
        {documents && documents.length > 0 && (
          <div className="orgDetail-section">
            <h3>Uploaded Documents</h3>
            <div className="orgDetail-documents">
              {documents.map((doc, idx) => (
                <div style={{display:"flex",alignItems:"center",gap:"10px", flexDirection:"column"}}>
                <div
                  key={idx}
                  className="orgDetail-doc-icon"
                  onClick={() => openDocumentPreview(doc.url)}
                  title={doc.name || `Document ${idx + 1}`}
                >
                  📄 
                </div>
                <p>{doc.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Preview */}
        {docPreviewUrl && (
          <div
            className="orgDetail-doc-preview-overlay"
            onClick={closeDocumentPreview}
          >
            <div
              className="orgDetail-doc-preview-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="orgDetail-doc-close-btn"
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
