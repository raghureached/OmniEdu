import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './DeactivateModal.css';

const DeactivateModal = ({ open, count, onCancel, onConfirm, variant = 'team' }) => {
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

  const isUser = String(variant).toLowerCase() === 'user';
  const title = isUser
    ? `Deactivate ${count === 1 ? 'User' : 'Users'}`
    : `Deactivate ${count === 1 ? 'Team' : 'Teams'}`;
  const description = isUser
    ? (count === 1
        ? 'Are you sure you want to deactivate this user? The user will lose access to the platform but historical records will be retained.'
        : `Are you sure you want to deactivate ${count} users? They will lose access to the platform but historical records will be retained.`)
    : (count === 1
        ? 'Are you sure you want to deactivate this team? This will remove all assigned users from this team and its subteams.'
        : `Are you sure you want to deactivate ${count} teams? This will remove all assigned users from these teams and their subteams.`);
  const confirmLabel = isUser
    ? `Deactivate ${count > 1 ? `${count} Users` : 'User'}`
    : `Deactivate ${count > 1 ? `${count} Teams` : 'Team'}`;

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
       <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div className="modal-icon">
          <AlertTriangle size={24} />
        </div>
       </div>
        <h2 id="modal-title" className="modal-title">{title}</h2>

        <p className="modal-text">{description}</p>

        <div className="modal-warning">
          <span className="warning-badge">⚠️</span>
          <span className="warning-text">This action cannot be undone</span>
        </div>

        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button 
            className="btn-primary" style={{background:"red"}}
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateModal;