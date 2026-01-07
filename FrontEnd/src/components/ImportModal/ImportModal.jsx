import React, { useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import './ImportModal.css';

const ImportModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  templateHeaders = [],
  templateData = [],
  title = "Upload file",
  acceptedFormats = ".csv,.xlsx,.xls",
  maxSizeText = "Maximum size: 25 MB",
  isImporting = false
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload a valid file format (.XLS, .XLSX, .CSV)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size exceeds 25 MB limit');
      return;
    }

    setSelectedFile(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      templateHeaders,
      ...templateData
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // Set column widths
    const colWidths = templateHeaders.map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, 'import_template.xlsx');
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="import-modal-overlay">
      <div className="import-modal-content">
        {/* Header */}
        <div className="import-modal-header">
          <h2 className="import-modal-title">{title}</h2>
          <button
            type="button"
            className="import-modal-close"
            onClick={handleCancel}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="import-modal-body">
          {/* Drag & Drop Area */}
          <div
            className={`import-dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            
            <div className="import-dropzone-content">
              {selectedFile ? (
                <>
                  <div className="excel-icon selected">
                    <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                      <defs>
                        <linearGradient id="excelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1C88C7" />
                          <stop offset="100%" stopColor="#011F5B" />
                        </linearGradient>
                      </defs>
                      <rect x="8" y="4" width="32" height="40" rx="3" fill="url(#excelGradient)"/>
                      <path d="M32 4V12C32 13.1046 32.8954 14 34 14H40L32 4Z" fill="#011F5B" opacity="0.8"/>
                      <rect x="12" y="20" width="24" height="2" rx="1" fill="white" opacity="0.9"/>
                      <rect x="12" y="25" width="20" height="2" rx="1" fill="white" opacity="0.7"/>
                      <rect x="12" y="30" width="18" height="2" rx="1" fill="white" opacity="0.7"/>
                      <circle cx="24" cy="12" r="6" fill="#10b981"/>
                      <path d="M22 12L23.5 13.5L26.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="selected-file-name">{selectedFile.name}</p>
                  <p className="selected-file-size">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button 
                    type="button" 
                    className="btn-primary"
                    onClick={handleChooseFile}
                  >
                    Replace file
                  </button>
                </>
              ) : (
                <>
                  <div className="excel-icon">
                    <svg width="72" height="72" viewBox="0 0 48 48" fill="none">
                      <defs>
                        <linearGradient id="excelGradientNormal" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1C88C7" />
                          <stop offset="100%" stopColor="#011F5B" />
                        </linearGradient>
                      </defs>
                      <rect x="8" y="4" width="32" height="40" rx="3" fill="url(#excelGradientNormal)"/>
                      <path d="M32 4V12C32 13.1046 32.8954 14 34 14H40L32 4Z" fill="#011F5B" opacity="0.8"/>
                      <rect x="12" y="16" width="24" height="2" rx="1" fill="white" opacity="0.9"/>
                      <rect x="12" y="21" width="20" height="2" rx="1" fill="white" opacity="0.7"/>
                      <rect x="12" y="26" width="22" height="2" rx="1" fill="white" opacity="0.7"/>
                      <rect x="12" y="31" width="18" height="2" rx="1" fill="white" opacity="0.5"/>
                      <rect x="12" y="36" width="16" height="2" rx="1" fill="white" opacity="0.5"/>
                    </svg>
                  </div>
                  <p className="dropzone-text">
                    Drag&Drop file here or{' '}
                    <button 
                      type="button" 
                      className="choose-file-link"
                      onClick={handleChooseFile}
                    >
                      Choose file
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Supported Formats */}
          <div className="import-info-row">
            <span className="import-info-text">Supported formats: .XLS .XLSX .CSV</span>
            <span className="import-info-text">{maxSizeText}</span>
          </div>

          {/* Template Section */}
          <div className="import-template-section">
            <div className="template-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <defs>
                  <linearGradient id="templateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1C88C7" />
                    <stop offset="100%" stopColor="#011F5B" />
                  </linearGradient>
                </defs>
                <rect x="8" y="4" width="32" height="40" rx="3" fill="url(#templateGradient)"/>
                <path d="M32 4V12C32 13.1046 32.8954 14 34 14H40L32 4Z" fill="#011F5B" opacity="0.8"/>
                <rect x="12" y="16" width="24" height="2" rx="1" fill="white" opacity="0.9"/>
                <rect x="12" y="21" width="20" height="2" rx="1" fill="white" opacity="0.7"/>
                <rect x="12" y="26" width="22" height="2" rx="1" fill="white" opacity="0.7"/>
                <rect x="12" y="31" width="18" height="2" rx="1" fill="white" opacity="0.5"/>
                <rect x="12" y="36" width="16" height="2" rx="1" fill="white" opacity="0.5"/>
              </svg>
            </div>
            <div className="template-content">
              <h3 className="template-title">Template</h3>
              <p className="template-description">
                You can download template as starting point for your own file.
              </p>
              <button 
                type="button" 
                className="template-download-btn"
                onClick={handleDownloadTemplate}
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="import-modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleCancel}
            disabled={isImporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;