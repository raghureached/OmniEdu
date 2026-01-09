import { ChevronLeft, X } from 'lucide-react';
import React, { useState } from 'react';
import { GoX } from 'react-icons/go';

const Step4ReviewConfirm = ({
  name,
  setName,
  selectedItem,
  selectedContentType,
  userMode,
  selectedUsers,
  selectedGroups,
  bulkEmails,
  assignDate,
  dueDate,
  sendEmail,
  enableReminder,
  resetProgress,
  enableRecurring,
  recurringInterval,
  customIntervalValue,
  customIntervalUnit,
  onBack,
  onSaveDraft,
  onConfirm
}) => {
  const [showModal, setShowModal] = useState(false);

  const getUserCount = () => {
    if (userMode === 'individual') return selectedUsers.length;
    if (userMode === 'group') return selectedGroups.length;
    if (userMode === 'bulk') {
      return bulkEmails.split('\n').filter(e => e.trim()).length;
    }
    return 0;
  };

  const getReminderText = () => {
    if (!enableReminder) return 'No reminders';
    if (dueDate) return '2 days before due date';
    return '7 working days after assignment';
  };

  const getRecurringText = () => {
    if (!enableRecurring) return '';

    const intervalMap = {
      '1m': 'Every 1 month',
      '3m': 'Every 3 months',
      '6m': 'Every 6 months',
      '1y': 'Every 1 year',
    };

    if (recurringInterval === 'custom' && customIntervalValue) {
      return `Every ${customIntervalValue} ${customIntervalUnit} after completion`;
    }

    return (intervalMap[recurringInterval] || 'Not configured') + ' after completion';
  };

  const userCount = getUserCount();

  const handleConfirmClick = () => {
    setShowModal(true);
  };

  const handleFinalConfirm = () => {
    setShowModal(false);
    onConfirm();
  };

  return (
    <>
      <div className="assignment-section step-content active">
        <h2 className="section-title">Step 4: Review & Confirm Assignment</h2>

        <div className="confirmation-details">
          <div className="confirmation-section">
            <h4>Assignment Name</h4>
              <input type="text" name='name' onChange={(e) => setName(e.target.value)} value={name}/>
          </div>  
          <div className="confirmation-section">
            <h4>📚 Content to Assign</h4>
            <ul>
              <li><strong>{selectedItem?.title}</strong> ({selectedContentType})</li>
            </ul>
          </div>

          <div className="confirmation-section">
            <h4>👥 Recipients</h4>
            <ul>
              <li><strong>{userCount}</strong> user{userCount > 1 ? 's' : ''} will receive this assignment</li>
              {userMode === 'individual' && (
                <li>Selected users: {selectedUsers.map(u => u.name).join(', ')}</li>
              )}
              {userMode === 'group' && (
                <li>Team assignment mode ({selectedGroups.length} team{selectedGroups.length > 1 ? 's' : ''})</li>
              )}
              {userMode === 'bulk' && (
                <li>Bulk email assignment mode</li>
              )}
            </ul>
          </div>

          <div className="confirmation-section">
            <h4>📅 Schedule</h4>
            <ul>
              <li><strong>Assign:</strong> {assignDate ? new Date(assignDate).toLocaleString() : 'Immediately'}</li>
              <li><strong>Due:</strong> {dueDate ? new Date(dueDate).toLocaleString() : 'No due date'}</li>
            </ul>
          </div>

          <div className="confirmation-section">
            <h4>🔔 Notifications & Settings</h4>
            <ul>
              <li><strong>Email notification:</strong> {sendEmail ? 'Yes - users will be notified' : 'No'}</li>
              <li><strong>Reminders:</strong> {getReminderText()}</li>
              <li><strong>Reset progress:</strong> {resetProgress ? 'Yes - existing progress will be reset to 0%' : 'No'}</li>
              {enableRecurring && <li><strong>Recurring:</strong> {getRecurringText()}</li>}
            </ul>
          </div>

          <div className="confirmation-section" style={{ background: '#e8f5e9', border: '1px solid #4caf50' }}>
            <h4>📊 Summary</h4>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#2e7d32', marginTop: '10px' }}>
              Total: {userCount} assignment{userCount > 1 ? 's' : ''}
            </p>
            <p style={{ color: '#558b2f', marginTop: '5px' }}>
              1 item × {userCount} user{userCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary" onClick={onBack} type="button">
            <ChevronLeft size={16} /> Previous
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onSaveDraft} type="button">
              Save as Draft
            </button>
            <button className="btn-primary" onClick={handleConfirmClick} disabled={userCount === 0 || name.trim() === ''} type="button">
              Confirm & Assign
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">⚠️ Confirm Assignment
              <button
                type="button"
                className="addOrg-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <GoX size={20} />
              </button>
            </div>

            <div className="confirmation-details">
              <p style={{ marginBottom: '20px' }}>You are about to create the following assignment:</p>

              <div className="confirmation-section">
                <h4>📚 Content</h4>
                <ul>
                  <li>{selectedItem?.title} ({selectedContentType})</li>
                </ul>
              </div>

              <div className="confirmation-section">
                <h4>👥 Users</h4>
                <ul>
                  <li>{userCount} user{userCount > 1 ? 's' : ''} will receive this assignment</li>
                </ul>
              </div>

              <div className="confirmation-section">
                <h4>📅 Schedule</h4>
                <ul>
                  <li><strong>Assign:</strong> {assignDate ? new Date(assignDate).toLocaleString() : 'Immediately'}</li>
                  <li><strong>Due:</strong> {dueDate ? new Date(dueDate).toLocaleString() : 'No due date'}</li>
                </ul>
              </div>

              <div className="confirmation-section">
                <h4>🔔 Notifications</h4>
                <ul>
                  <li><strong>Email notification:</strong> {sendEmail ? 'Enabled' : 'Disabled'}</li>
                  <li><strong>Reminders:</strong> {enableReminder ? 'Enabled' : 'Disabled'}</li>
                  <li><strong>Reset progress:</strong> {resetProgress ? 'Enabled' : 'Disabled'}</li>
                </ul>
              </div>

              {enableRecurring && (
                <div className="confirmation-section">
                  <h4>🔄 Recurring Settings</h4>
                  <ul>
                    <li><strong>Frequency:</strong> {getRecurringText()}</li>
                    <li>Progress auto-resets with each cycle</li>
                    <li>Notifications sent with each reassignment</li>
                    <li>Continues until user/content is deactivated</li>
                  </ul>
                </div>
              )}

              <div className="confirmation-section" style={{ background: '#e3f2fd', border: '1px solid #2196f3' }}>
                <h4>📊 Total Assignments to Create</h4>
                <p style={{ fontSize: '24px', fontWeight: '600', color: '#1976d2', marginTop: '10px' }}>
                  {userCount}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-back" onClick={() => setShowModal(false)} type="button">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleFinalConfirm} disabled={userCount === 0 || name === ''} type="button">
                ✓ Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Step4ReviewConfirm;
