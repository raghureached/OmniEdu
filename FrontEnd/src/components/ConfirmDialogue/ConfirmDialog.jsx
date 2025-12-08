import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialogContext = createContext(null);

const ConfirmDialog = ({ config, onConfirm, onCancel }) => {
  const {
    title = 'Are you sure?',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    showCheckbox = false,
    checkboxLabel = 'I understand that this action cannot be undone.',
    note,
  } = config;

  const [isChecked, setIsChecked] = useState(!showCheckbox);

  const handleConfirm = () => {
    if (showCheckbox && !isChecked) return;
    onConfirm();
  };

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="confirm-header">
          <div className={`confirm-icon confirm-icon-${type}`}>
            <AlertCircle size={24} />
          </div>
          <button
            type="button"
            className="confirm-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="confirm-content">
          <h2 className="confirm-title">{title}</h2>
          {message && <p className="confirm-message">{message}</p>}

          {showCheckbox && (
            <label className="confirm-checkbox-wrapper">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="confirm-checkbox"
              />
              <span className="confirm-checkbox-label">{checkboxLabel}</span>
            </label>
          )}

          {note && (
            <p className="confirm-note">
              <span className="confirm-note-label">Note:</span> {note}
            </p>
          )}
        </div>

        <div className="confirm-actions">
          <button
            type="button"
            className={`confirm-btn confirm-btn-${type}`}
            onClick={handleConfirm}
            disabled={showCheckbox && !isChecked}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="confirm-btn confirm-btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogConfig, setDialogConfig] = useState(null);
  const resolveRef = React.useRef(null);

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialogConfig(config);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(true);
      resolveRef.current = null;
    }
    setDialogConfig(null);
  }, []);

  const handleCancel = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(false);
      resolveRef.current = null;
    }
    setDialogConfig(null);
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  // Expose confirm globally for non-React code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showConfirm = confirm;
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.showConfirm = null;
      }
    };
  }, [confirm]);

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      {dialogConfig && (
        <ConfirmDialog
          config={dialogConfig}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};

// Make confirm available globally for non-React code
if (typeof window !== 'undefined') {
  window.showConfirm = null; // Will be set by the provider
}