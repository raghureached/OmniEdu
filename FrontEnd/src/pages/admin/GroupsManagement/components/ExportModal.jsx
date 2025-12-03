import React, { useState } from 'react';
import { Download, X, FileText, Users, CheckCircle } from 'lucide-react';
import './ExportModal.css';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedCount, 
  totalCount,
  hasMembers,
  exportType: defaultExportType = 'users' // 'users' or 'groups'
}) => {
  const [exportScope, setExportScope] = useState('selected');
  
  if (!isOpen) return null;

  const handleExport = () => {
    onConfirm(exportScope);
    onClose();
  };

  // Dynamic labels based on export type
  const isUserExport = defaultExportType === 'users';
  const itemLabel = isUserExport ? 'user' : 'team';
  const itemsLabel = isUserExport ? 'users' : 'teams';

  return (
    <div className="export-modal-overlay">
      <div className="export-modal-container">
        {/* Header */}
        <div className="export-modal-header">
          <div className="export-modal-header-content">
            <div className="export-modal-icon">
              <Download size={20} />
            </div>
            <div>
              <h2 className="export-modal-title">
                {isUserExport ? 'Export Users' : 'Export Teams'}
              </h2>
              <p className="export-modal-subtitle">Choose what to export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="export-modal-close-btn"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="export-modal-content">
          {/* Export Options */}
          <div className="export-options">
            {/* Selected Items Option */}
            {selectedCount > 0 && (
              <label className={`export-option ${exportScope === 'selected' ? 'export-option-active' : ''}`}>
                <input
                  type="radio"
                  name="exportScope"
                  value="selected"
                  checked={exportScope === 'selected'}
                  onChange={(e) => setExportScope(e.target.value)}
                  className="export-radio"
                />
                <div className="export-option-content">
                  <div className="export-option-title">
                    <Users size={16} />
                    Export Selected {isUserExport ? 'Users' : 'Teams'}
                  </div>
                  <p className="export-option-description">
                    Export <strong>{selectedCount}</strong> selected {selectedCount === 1 ? itemLabel : itemsLabel}
                    {isUserExport 
                      ? ' with complete profile details' 
                      : (hasMembers ? ' with member details' : '')}
                  </p>
                </div>
              </label>
            )}

            {/* All Items Option */}
            <label className={`export-option ${exportScope === 'all' ? 'export-option-active' : ''}`}>
              <input
                type="radio"
                name="exportScope"
                value="all"
                checked={exportScope === 'all'}
                onChange={(e) => setExportScope(e.target.value)}
                className="export-radio"
              />
              <div className="export-option-content">
                <div className="export-option-title">
                  <FileText size={16} />
                  Export All {isUserExport ? 'Users' : 'Teams'}
                </div>
                <p className="export-option-description">
                  Export all <strong>{totalCount}</strong> {totalCount === 1 ? itemLabel : itemsLabel}
                  {isUserExport 
                    ? ' (basic profile information)' 
                    : ' (teams and subteams only)'}
                </p>
              </div>
            </label>
          </div>

          {/* Export Details Info Box */}
          <div className="export-info-box">
            <div className="export-info-header">
              <CheckCircle size={16} />
              <span>What will be exported:</span>
            </div>
            <ul className="export-info-list">
              {isUserExport ? (
                <>
                  <li>Name and email addresses</li>
                  {exportScope === 'selected' && (
                    <>
                      <li>Designation and role information</li>
                      <li>Team and subteam assignments</li>
                    </>
                  )}
                  {exportScope === 'all' && (
                    <>
                      <li>Basic profile information</li>
                      <li>Team assignments</li>
                    </>
                  )}
                  <li>Data will be exported as CSV file</li>
                </>
              ) : (
                <>
                  <li>Team names and subteams</li>
                  {exportScope === 'selected' && hasMembers && (
                    <>
                      <li>Member names and emails</li>
                      <li>Member subteam assignments</li>
                    </>
                  )}
                  <li>Data will be exported as CSV file</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="export-modal-actions">
            <button
              onClick={onClose}
              className="export-btn export-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="export-btn export-btn-primary"
            >
              <Download size={16} />
              Export to CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;