import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

const Step3ScheduleSettings = ({ 
  assignDate,
  setAssignDate,
  dueDate,
  setDueDate,
  sendEmail,
  setSendEmail,
  enableReminder,
  setEnableReminder,
  resetProgress,
  setResetProgress,
  enableRecurring,
  setEnableRecurring,
  recurringInterval,
  setRecurringInterval,
  customIntervalValue,
  setCustomIntervalValue,
  customIntervalUnit,
  setCustomIntervalUnit,
  selectedContentType,
  selectedItem,
  selectedUsers,
  onNext,
  onBack
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const getReminderHelpText = () => {
    if (dueDate) {
      return 'Send reminder 2 days before due date';
    }
    return 'Send reminder after assignment';
  };

  const getAutoReminderText = () => {
    if (dueDate) {
      return 'Default: 2 days before due date';
    }
    return 'Default: 7 working days after assignment (excludes weekends)';
  };

  const getRecurringText = () => {
    const intervalMap = {
      '1m': 'Every 1 month after completion',
      '3m': 'Every 3 months after completion',
      '6m': 'Every 6 months after completion',
      '1y': 'Every 1 year after completion',
    };
    
    if (recurringInterval === 'custom' && customIntervalValue) {
      return `Every ${customIntervalValue} ${customIntervalUnit} after completion`;
    }
    
    return intervalMap[recurringInterval] || '';
  };

  return (
    <div className="assignment-section step-content active">
      <h2 className="section-title">Step 3: Schedule & Settings</h2>

      <div className="schedule-grid">
        <div className="datetime-group">
          <label>Assign Date & Time</label>
          <input 
            type="datetime-local" 
            value={assignDate}
            onChange={(e) => setAssignDate(e.target.value)}
          />
          <div className="help-text">Leave blank to assign immediately</div>
        </div>
        <div className="datetime-group">
          <label>Due Date & Time</label>
          <input 
            type="datetime-local" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <div className="help-text">Leave blank for no due date</div>
        </div>
      </div>

      <div style={{ height: '30px' }}></div>

      {/* Email Notification Toggle */}
      <div className="form-group">
        <div className="toggle-group">
          <div className="toggle-label" onClick={() => setSendEmail(!sendEmail)}>
            <strong>Send Email Notification</strong>
            <div className="help-text">Users will receive an email when content is assigned</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Reminder Toggle */}
      <div className="form-group">
        <div className="toggle-group">
          <div className="toggle-label" onClick={() => setEnableReminder(!enableReminder)}>
            <strong>Enable Reminder Notifications</strong>
            <div className="help-text">{getReminderHelpText()}</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={enableReminder}
              onChange={(e) => setEnableReminder(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {enableReminder && (
          <div style={{ marginTop: '15px' }}>
            <div className="info-box">
              <strong>Automatic Reminder Schedule</strong>
              <p>{getAutoReminderText()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Reset Progress Toggle */}
      <div className="form-group">
        <div className="toggle-group">
          <div className="toggle-label" onClick={() => setResetProgress(!resetProgress)}>
            <strong>Reset Progress (if re-assigning)</strong>
            <div className="help-text">Reset completion status and scores for selected users</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={resetProgress}
              onChange={(e) => setResetProgress(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {resetProgress && selectedUsers.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <div className="warning-box">
              <div className="warning-box-icon">⚠️</div>
              <div className="warning-box-content">
                <strong>Progress Reset Warning</strong>
                <p>Selected users may have already started or completed this content. 
                Progress will be reset to 0% (completion status, scores, certificates). 
                Assignment history will be maintained in records.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recurring Assignment Toggle */}
      <div className="form-group">
        <div className="toggle-group">
          <div className="toggle-label" onClick={() => setEnableRecurring(!enableRecurring)}>
            <strong>Enable Recurring Assignment</strong>
            <div className="help-text">Automatically reassign after user completion</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={enableRecurring}
              onChange={(e) => setEnableRecurring(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {enableRecurring && (
          <div className="recurring-options visible">
            <h4>📅 Recurring Schedule</h4>
            <div className="form-group">
              <label>Recurrence Interval</label>
              <select 
                value={recurringInterval}
                onChange={(e) => setRecurringInterval(e.target.value)}
              >
                <option value="">Select interval...</option>
                <option value="1m">Every 1 month after completion</option>
                <option value="3m">Every 3 months after completion</option>
                <option value="6m">Every 6 months after completion</option>
                <option value="1y">Every 1 year after completion</option>
                <option value="custom">Custom interval</option>
              </select>
            </div>

            {recurringInterval === 'custom' && (
              <div className="custom-interval visible">
                <label>Custom Recurrence</label>
                <div className="custom-interval-input">
                  <input 
                    type="number" 
                    min="1" 
                    placeholder="Number"
                    value={customIntervalValue}
                    onChange={(e) => setCustomIntervalValue(e.target.value)}
                  />
                  <select 
                    value={customIntervalUnit}
                    onChange={(e) => setCustomIntervalUnit(e.target.value)}
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                <div className="help-text">Specify how long after completion to reassign</div>
              </div>
            )}

            <div className="info-box" style={{ marginTop: '15px' }}>
              <strong>ℹ️ Recurring Assignment Behavior</strong>
              <p>• Progress will be automatically reset with each recurrence<br/>
              • Email notifications will be sent with each new assignment<br/>
              • Recurring continues indefinitely until user or content is deactivated<br/>
              • Due date intervals will be maintained for each cycle</p>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings for Learning Paths */}
      {selectedContentType === 'Learning Path' && (
        <div id="advancedScheduling">
          <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
            <div className="advanced-toggle-header">
              <span>⚙️ Advanced: Individual Element Scheduling</span>
              <span>{showAdvanced ? '▲' : '▼'}</span>
            </div>
            {showAdvanced && (
              <div className="advanced-content visible">
                <p style={{ color: '#7f8c8d', marginBottom: '15px', fontSize: '14px' }}>
                  Set individual assign and due dates for each element in the learning path.
                </p>
                <div className="warning-box">
                  <div className="warning-box-icon">⚠️</div>
                  <div className="warning-box-content">
                    <strong>Note on Recurring Assignments</strong>
                    <p>Advanced element scheduling is not compatible with recurring assignments. If recurring is enabled, path-level dates will be used.</p>
                  </div>
                </div>
                <div style={{ marginTop: '15px' }}>
                  <div className="info-box">
                    <strong>ℹ️ Feature Available</strong>
                    <p>Individual element scheduling can be configured after creating the base assignment.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end',gap: '10px',marginTop: '20px' }}>
        <button className="btn-secondary" onClick={onBack} type="button">
          <ChevronLeft size={16}/> Previous
        </button>
        <button className="btn-primary" onClick={onNext} type="button">
          Next: Review & Assign <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
};

export default Step3ScheduleSettings;
