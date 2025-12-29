import React, { useState } from 'react';
import { Download, X, FileText, Users, CheckCircle, BookOpen, Target, Award } from 'lucide-react';
import './ExportModal.css';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedCount, 
  totalCount,
  hasMembers,
  exportType: defaultExportType = 'users' // 'users', 'teams', 'modules', 'surveys', 'learningpaths', 'assessments'
}) => {
  const [exportScope, setExportScope] = useState('selected');
  
  if (!isOpen) return null;

  const handleExport = () => {
    onConfirm(exportScope);
    onClose();
  };

  // Dynamic labels based on export type
  const getExportLabels = (type) => {
    switch (type) {
      case 'users':
        return {
          title: 'Export Users',
          itemLabel: 'user',
          itemsLabel: 'users',
          icon: Users,
          selectedDescription: 'with complete profile details',
          allDescription: '(basic profile information)',
          exportDetails: {
            selected: [
              'Name and email addresses',
              'Designation and role information',
              'Team and subteam assignments',
              'Data will be exported as CSV file'
            ],
            all: [
              'Basic profile information',
              'Team assignments',
              'Data will be exported as CSV file'
            ]
          }
        };
      case 'teams':
        return {
          title: 'Export Teams',
          itemLabel: 'team',
          itemsLabel: 'teams',
          icon: Users,
          selectedDescription: 'with member details',
          allDescription: '(teams and subteams only)',
          exportDetails: {
            selected: [
              'Team names and subteams',
              'Member names and emails',
              'Member subteam assignments',
              'Data will be exported as CSV file'
            ],
            all: [
              'Team names and subteams',
              'Data will be exported as CSV file'
            ]
          }
        };
      case 'modules':
        return {
          title: 'Export Modules',
          itemLabel: 'module',
          itemsLabel: 'modules',
          icon: BookOpen,
          selectedDescription: 'with complete module details',
          allDescription: 'with complete module details',
          exportDetails: {
            selected: [
              'Module title and description',
              'Learning outcomes and prerequisites',
              'Duration, credits, stars, badges',
              'Team and subteam assignments',
              'Tags and category information',
              'Thumbnail links',
              'Data will be exported as CSV file'
            ],
            all: [
              'Module title and description',
              'Category and basic information',
              'Duration and credits',
              'Data will be exported as CSV file'
            ]
          }
        };
      case 'surveys':
        return {
          title: 'Export Surveys',
          itemLabel: 'survey',
          itemsLabel: 'surveys',
          icon: FileText,
          selectedDescription: 'with complete survey details',
          allDescription: '(basic survey information)',
          exportDetails: {
            selected: [
              'Survey title and description',
              'Questions and response options',
              'Survey settings and configuration',
              'Team and subteam assignments',
              'Tags and category information',
              'Data will be exported as CSV file'
            ],
            all: [
              'Survey title and description',
              'Category and basic information',
              'Survey status',
              'Data will be exported as CSV file'
            ]
          }
        };
      case 'learningpaths':
        return {
          title: 'Export Learning Paths',
          itemLabel: 'learning path',
          itemsLabel: 'learning paths',
          icon: Target,
          selectedDescription: 'with complete learning path details',
          allDescription: '(basic learning path information)',
          exportDetails: {
            selected: [
              'Learning path title and description',
              'Lessons and modules included',
              'Duration and difficulty level',
              'Team and subteam assignments',
              'Category and tags',
              'Prerequisites and outcomes',
              'Data will be exported as CSV file'
            ],
            all: [
              'Learning path title and description',
              'Category and basic information',
              'Duration and status',
              'Data will be exported as CSV file'
            ]
          }
        };
      case 'assessments':
        return {
          title: 'Export Assessments',
          itemLabel: 'assessment',
          itemsLabel: 'assessments',
          icon: Award,
          selectedDescription: 'with complete assessment details',
          allDescription: '(basic assessment information)',
          exportDetails: {
            selected: [
              'Assessment title and description',
              'Questions and answer options',
              'Assessment settings and configuration',
              'Team and subteam assignments',
              'Tags and category information',
              'Scoring and grading details',
              'Data will be exported as CSV file'
            ],
            all: [
              'Assessment title and description',
              'Category and basic information',
              'Assessment status and type',
              'Data will be exported as CSV file'
            ]
          }
        };
      default:
        return {
          title: 'Export Items',
          itemLabel: 'item',
          itemsLabel: 'items',
          icon: FileText,
          selectedDescription: 'with complete details',
          allDescription: '(basic information)',
          exportDetails: {
            selected: ['Complete details', 'Data will be exported as CSV file'],
            all: ['Basic information', 'Data will be exported as CSV file']
          }
        };
    }
  };

  const labels = getExportLabels(defaultExportType);
  const IconComponent = labels.icon;

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
                {labels.title}
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
                    <IconComponent size={16} />
                    Export Selected {labels.title.replace('Export ', '')}
                  </div>
                  <p className="export-option-description">
                    Export <strong>{selectedCount}</strong> selected {selectedCount === 1 ? labels.itemLabel : labels.itemsLabel}
                    {labels.selectedDescription && ` ${labels.selectedDescription}`}
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
                  Export All {labels.title.replace('Export ', '')}
                </div>
                <p className="export-option-description">
                  Export all <strong>{totalCount}</strong> {totalCount === 1 ? labels.itemLabel : labels.itemsLabel}
                  {labels.allDescription && ` ${labels.allDescription}`}
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
              {labels.exportDetails[exportScope].map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
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