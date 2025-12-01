const DeactivateModal = ({ open, count, onCancel, onConfirm }) => {
    if (!open) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content deactivate-modal">
          <h2 className="modal-title">Deactivate Teams</h2>
  
          <p className="modal-text">
            {count === 1
              ? "Are you sure you want to deactivate this team? This will remove all assigned users from this team and its subteams."
              : `Are you sure you want to deactivate ${count} teams? This will remove all assigned users from these teams and their subteams.`}
          </p>
  
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-danger" onClick={onConfirm}>Deactivate</button>
          </div>
        </div>
      </div>
    );
  };
  export default DeactivateModal;