import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CustomSelect from '../../../../components/dropdown/DropDown';

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
  elementSchedules,
  setElementSchedules,
  enforceOrder,
  setEnforceOrder,
  onNext,
  onBack
}) => {
  // Advanced section is always visible; use toggle to enable per-element scheduling
  const [usePerElementScheduling, setUsePerElementScheduling] = useState(false);

  // Initialize elementSchedules for Learning Path when enabling per-element scheduling
  useEffect(() => {
    if (
      usePerElementScheduling &&
      selectedContentType === 'Learning Path' &&
      selectedItem && Array.isArray(selectedItem.lessons)
    ) {
      if (!elementSchedules || elementSchedules.length === 0) {
        const init = selectedItem.lessons.map(lesson => {
          const lessonId = lesson.id || lesson._id;
          return {
            elementId: lessonId,
            assign_on: '',
            due_date: ''
          };
        });
        setElementSchedules(init);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usePerElementScheduling, selectedContentType, selectedItem]);

  // If the Learning Path itself enforces order, mirror it and lock the toggle
  useEffect(() => {
    if (selectedContentType === 'Learning Path' && selectedItem && typeof selectedItem.enforceOrder === 'boolean') {
      if (selectedItem.enforceOrder && !enforceOrder) setEnforceOrder(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContentType, selectedItem]);

  const updateElementSchedule = (elementId, field, value) => {
    setElementSchedules(prev => {
      const exists = prev.find(e => e.elementId === elementId);
      if (exists) {
        return prev.map(e => e.elementId === elementId ? { ...e, [field]: value } : e);
      }
      return [...prev, { elementId, assign_on: '', due_date: '', [field]: value }];
    });
  };

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
              <CustomSelect
                value={recurringInterval}
                options={[
                  { value: "", label: "Select interval..." },
                  { value: "1m", label: "Every 1 month after completion" },
                  { value: "3m", label: "Every 3 months after completion" },
                  { value: "6m", label: "Every 6 months after completion" },
                  { value: "1y", label: "Every 1 year after completion" },
                  { value: "custom", label: "Custom interval" }
                ]}
                onChange={(value) => setRecurringInterval(value)}
                placeholder="Select interval..."
                searchable={false}
              />
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
                  <CustomSelect
                    value={customIntervalUnit}
                    options={[
                      { value: "days", label: "Days" },
                      { value: "weeks", label: "Weeks" },
                      { value: "months", label: "Months" },
                      { value: "years", label: "Years" }
                    ]}
                    onChange={(value) => setCustomIntervalUnit(value)}
                    searchable={false}
                  />
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
          <div className="advanced-toggle">
            <div className="advanced-toggle-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚙️ Advanced: Individual Resource Scheduling</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={usePerElementScheduling}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setUsePerElementScheduling(enabled);
                    if (!enabled) {
                      setElementSchedules([]);
                    } else if (
                      selectedItem && Array.isArray(selectedItem.lessons) && (!elementSchedules || elementSchedules.length === 0)
                    ) {
                      const init = selectedItem.lessons.map(lesson => ({ elementId: lesson._id, assign_on: '', due_date: '' }));
                      setElementSchedules(init);
                    }
                  }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="advanced-content visible">
              <p style={{ color: '#7f8c8d', marginBottom: '15px', fontSize: '14px' }}>
                Set individual assign and due dates for each resource in the learning path.
              </p>
              <div className="warning-box">
                <div className="warning-box-icon">⚠️</div>
                <div className="warning-box-content">
                  <strong>Note on Recurring Assignments</strong>
                  <p>Advanced resource scheduling is not compatible with recurring assignments. If recurring is enabled, path-level dates will be used.</p>
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                {selectedItem?.enforceOrder && (
                  <div className="info-box" style={{ marginBottom: 10 }}>
                    <strong>Learning Path enforces order</strong>
                    <p>This learning path is configured to require sequential completion. Subsequent lessons will be locked until the previous one is available/completed.</p>
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={enforceOrder}
                    onChange={(e) => setEnforceOrder(e.target.checked)}
                    disabled={true}
                  />
                  Enforce path order (lock subsequent lessons until previous is available)
                </label>
              </div>

              <div style={{ marginTop: '15px' }}>
                {usePerElementScheduling && Array.isArray(selectedItem?.lessons) && selectedItem.lessons.length > 0 ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {selectedItem.lessons.map((lesson, idx) => {
                      const lessonId = lesson.id || lesson._id;
                      const sched = elementSchedules.find(e => e.elementId === lessonId) || {};
                      return (
                        <div key={lessonId} className="datetime-group">
                          <div style={{ fontWeight: 600, marginBottom: 8 }}>{idx + 1}. {lesson.title}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label>Assign Date & Time</label>
                              <input
                                type="datetime-local"
                                value={sched.assign_on || assignDate}
                                onChange={(e) => updateElementSchedule(lessonId, 'assign_on', e.target.value)}
                              />
                            </div>
                            <div>
                              <label>Due Date & Time</label>
                              <input
                                type="datetime-local"
                                value={sched.due_date || dueDate}
                                onChange={(e) => updateElementSchedule(lessonId, 'due_date', e.target.value)}
                                />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <p>{usePerElementScheduling ? 'No resources found in this Learning Path' : 'Enable per-resource scheduling to set dates for each lesson'}</p>
                  </div>
                )}
              </div>
            </div>
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
