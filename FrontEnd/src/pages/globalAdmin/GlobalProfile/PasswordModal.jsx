import React, { useState } from 'react';
import api from '../../../services/apiOld';
import CustomLoader from '../../../components/common/Loading/CustomLoader';

const PasswordChangeModal = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading,setLoading] = useState(false)

  if (!isOpen) return null;

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    try {
        setLoading(true)
        const response = await api.put('/api/globalAdmin/changeGlobalPassword', { currentPassword, newPassword });
        console.log(response)
        if(response.status === 200){
            setLoading(false)
            onClose();
        }
    } catch (error) {
        setLoading(false)
        console.error('Error changing password:', error);
        setError('Failed to change password. Please try again.');
    }

    setError('');
    // onSubmit({ currentPassword, newPassword });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.modalTitle}>Change Password</h2>
        {error && <p style={styles.error}>{error}</p>}
        {loading ? <CustomLoader text="Changing Password..." /> : <form onSubmit={handleSubmit} >
          <div style={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your current password"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Enter your new password"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm your new password"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.buttons}>
            <button type="submit" style={styles.submitButton} onClick={handleSubmit}>Change Password</button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Cancel</button>
          </div>
        </form>}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  modal: {
    background: '#fff',
    borderRadius: '8px',
    padding: '24px',
    width: '320px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    boxSizing: 'border-box',
  },
  formGroup: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '8px 10px',
    fontSize: '14px',
    marginTop: '6px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  error: {
    color: 'red',
    marginBottom: '12px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  submitButton: {
    backgroundColor: '#5570f1',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default PasswordChangeModal;
