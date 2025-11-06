import React from 'react';

const SummaryPanel = ({ 
  selectedContentType,
  selectedItem,
  userMode,
  selectedUsers,
  selectedGroups,
  bulkEmails,
  assignDate,
  dueDate,
  sendEmail,
  enableReminder,
  enableRecurring,
  recurringInterval,
  customIntervalValue,
  customIntervalUnit
}) => {
  
  const getUserCount = () => {
    if (userMode === 'individual') return selectedUsers.length;
    if (userMode === 'group') return selectedGroups.length;
    if (userMode === 'bulk') {
      return bulkEmails.split('\n').filter(e => e.trim()).length;
    }
    return 0;
  };

  const getRecurringText = () => {
    const intervalMap = {
      '1m': 'Every 1 month',
      '3m': 'Every 3 months',
      '6m': 'Every 6 months',
      '1y': 'Every 1 year',
    };
    
    if (recurringInterval === 'custom' && customIntervalValue) {
      return `Every ${customIntervalValue} ${customIntervalUnit}`;
    }
    
    return intervalMap[recurringInterval] || '-';
  };

  const userCount = getUserCount();
  const totalAssignments = (selectedItem ? 1 : 0) * userCount;

  return (
    <div className="summary-panel">
      <h3>Assignment Summary</h3>
      
      <div className="summary-item">
        <strong>Content Type</strong>
        <div className="summary-value">
          {selectedContentType || 'Not selected'}
        </div>
      </div>

      <div className="summary-item">
        <strong>Selected Item</strong>
        <div className="summary-value">
          {selectedItem ? '1 item' : 'None'}
        </div>
        {selectedItem && (
          <div className="summary-list">{selectedItem.title}</div>
        )}
      </div>

      <div className="summary-item">
        <strong>Users to Assign</strong>
        <div className="summary-value">{userCount}</div>
      </div>

      <div className="summary-item">
        <strong>Assign Date</strong>
        <div className="summary-value">
          {assignDate ? new Date(assignDate).toLocaleDateString() : 'Immediately'}
        </div>
      </div>

      <div className="summary-item">
        <strong>Due Date</strong>
        <div className="summary-value">
          {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
        </div>
      </div>

      <div className="summary-item">
        <strong>Email Notification</strong>
        <div className="summary-value">
          {sendEmail ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      <div className="summary-item">
        <strong>Reminders</strong>
        <div className="summary-value">
          {enableReminder ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {enableRecurring && (
        <div className="summary-item">
          <strong>Recurring</strong>
          <div className="summary-value">{getRecurringText()}</div>
        </div>
      )}

      <div className="summary-item">
        <strong>Total Assignments</strong>
        <div className="summary-value">{totalAssignments}</div>
        <div className="help-text">1 item × {userCount} Users</div>
      </div>

      {totalAssignments > 50 && (
        <div className="validation-warning">
          ⚠️ Large assignment: {totalAssignments} total assignments will be created
        </div>
      )}
    </div>
  );
};

export default SummaryPanel;
