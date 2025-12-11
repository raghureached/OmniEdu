import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import './UserSupportTicket.css';
import { useDispatch, useSelector } from 'react-redux';
import { createUserTicket, updateUserTicket } from '../../../store/slices/userTicketsSlice';

export default function SupportTicketRaiser({ onClose, ticket, onSuccess }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    errorMessage: ''
  });
  
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.userTickets);

  // Prefill in edit mode
  React.useEffect(() => {
    if (ticket) {
      setFormData({
        subject: ticket.subject || '',
        description: ticket.description || '',
        errorMessage: ticket.errorMessage || ''
      });
      const atts = Array.isArray(ticket.attachments)
        ? ticket.attachments.map((a) => ({ name: a.fileName || '', size: a.size || '' }))
        : [];
      setAttachments(atts);
    } else {
      // switched to add mode: clear previous edit values
      setFormData({ subject: '', description: '', errorMessage: '' });
      setAttachments([]);
    }
  }, [ticket]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB'
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      errorMessage: formData.errorMessage || '',
      attachments: attachments.map((a) => ({ fileName: a.name, size: a.size })),
    };
    try {
      let action;
      if (ticket?.ticketId) {
        action = await dispatch(updateUserTicket({ ticketId: ticket.ticketId, data: payload }));
      } else {
        action = await dispatch(createUserTicket(payload));
      }
      const ok = ticket?.ticketId ? updateUserTicket.fulfilled.match(action) : createUserTicket.fulfilled.match(action);
      if (ok) {
        // Call success callback with the created/updated ticket ID
        if (onSuccess) {
          onSuccess(action.payload?.ticketId || ticket?.ticketId);
        }
        // Reset form
        setFormData({ subject: '', description: '', errorMessage: '' });
        setAttachments([]);
        if (onClose) onClose();
      } else {
        setError(action.payload?.message || 'Failed to submit ticket');
      }
    } catch (_) {
      setError('Failed to submit ticket');
    }
  };

  const isFormValid = formData.subject && formData.description;

  return (
    <div className="ticket-form-container">
      {/* Header */}
      <div className="ticket-header">
        <div>
          <h1 className="ticket-header-title">User Support Ticket</h1>
          <p className="ticket-header-subtitle">
            Submit issues or request assistance for your learning experience
          </p>
        </div>
        <button 
          onClick={onClose}
         style={{
              position: 'absolute',
              top: '22px',
              right: '25px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              width: '53px',
              height: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <div className="ticket-form">
        {error && (
          <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
        )}
        {/* Subject */}
        <div className="ticket-form-group">
          <label className="ticket-form-label">
            Subject <span className="ticket-required">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief description of the issue"
            className="ticket-form-input"
            required
          />
        </div>

        {/* Description */}
        <div className="ticket-form-group">
          <label className="ticket-form-label">
            Detailed Description <span className="ticket-required">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable"
            rows="5"
            className="ticket-form-textarea"
            required
          />
        </div>

        {/* Error Message */}
        <div className="ticket-form-group">
          <label className="ticket-form-label">
            Error Message (if any)
          </label>
          <textarea
            name="errorMessage"
            value={formData.errorMessage}
            onChange={handleInputChange}
            placeholder="Copy and paste any error messages here"
            rows="3"
            className="ticket-form-textarea error-textarea"
          />
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label className="form-label">
            Attachments
          </label>
          <div className="upload-area">
            <Upload className="upload-icon" />
            <label className="upload-label">
              <span className="upload-link">Click to upload</span>
              <span className="upload-text"> or drag and drop</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="upload-input"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt"
              />
            </label>
            <p className="upload-hint">PNG, JPG, PDF, DOC up to 10MB</p>
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="attachment-list">
              {attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <div className="attachment-info">
                    <div className="attachment-icon">
                      <span className="file-extension">
                        {file.name.split('.').pop().toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="file-name">{file.name}</p>
                      <p className="file-size">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="remove-button"
                  >
                    <X className="remove-icon" size={20}/>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-content">
            <AlertCircle className="info-icon" />
            <div className="info-text">
              <p className="info-title">Response Time Expectations:</p>
              <ul className="info-list">
                <li>Critical: 1-2 hours</li>
                <li>High: 4-6 hours</li>
                <li>Medium: 24 hours</li>
                <li>Low: 48 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="ticket-form-actions">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`btn-primary ${(!isFormValid || loading) ? 'disabled' : ''}`}
          >
            {loading ? (ticket ? 'Saving...' : 'Submitting...') : (ticket ? 'Save Changes' : 'Submit Ticket')}
          </button>
        </div>
      </div>
    </div>
  );
}