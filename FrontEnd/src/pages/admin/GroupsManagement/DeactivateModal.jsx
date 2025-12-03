import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeactivateModal.css';

const DeactivateModal = ({ open, count, onCancel, onConfirm }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-content" style={{boxShadow:"none"}}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close"
          onClick={onCancel}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="modal-icon">
          <AlertTriangle size={24} />
        </div>

        <h2 id="modal-title" className="modal-title">
          Deactivate {count === 1 ? 'Team' : 'Teams'}
        </h2>

        <p className="modal-text">
          {count === 1
            ? "Are you sure you want to deactivate this team? This will remove all assigned users from this team and its subteams."
            : `Are you sure you want to deactivate ${count} teams? This will remove all assigned users from these teams and their subteams.`}
        </p>

        <div className="modal-warning">
          <span className="warning-badge">⚠️</span>
          <span className="warning-text">This action cannot be undone</span>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
            type="button"
          >
            Deactivate {count > 1 ? `${count} Teams` : 'Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;