import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, Building, FileText, AlertCircle, Edit3, Trash2, CheckCircle, ChevronDown } from 'lucide-react';

const TicketDetails = ({ ticket, onClose, onStatusUpdate, onDelete, ticketType }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ticket.status);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const statusOptions = ['Open', 'In-Progress', 'Resolved'];

  const handleStatusUpdate = () => {
    if (selectedStatus !== ticket.status) {
      onStatusUpdate({ ...ticket, status: selectedStatus });
    }
    setIsEditingStatus(false);
  };
    
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'In-Progress':
        return { bg: '#e0f2fe', color: '#0284c7' };
      case 'Resolved':
        return { bg: '#d1fae5', color: '#059669' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const statusColors = getStatusColor(ticket.status);

  return (
    <div className="ticket-details-overlay">
      <div className="ticket-details-container">
        {/* Header */}
        <div className="ticket-details-header">
          <div className="ticket-details-header-content">
            <button className="back-button" onClick={onClose}>
              <ArrowLeft size={20} />
              Back to Tickets
            </button>
            <div className="ticket-type-badge">
              {ticketType === 'user' ? 'User Ticket' : 'Admin Ticket'}
            </div>
          </div>
        </div>

        {/* Ticket Content */}
        <div className="ticket-details-content">
          {/* Ticket ID and Status */}
          <div className="ticket-details-top">
            <div className="ticket-id-section">
              <h1 className="ticket-id">#{ticket.ticketId}</h1>
              <span 
                className="ticket-status-badge"
                style={{ backgroundColor: statusColors.bg, color: statusColors.color }}
              >
                {ticket.status}
              </span>
            </div>
            
            <div className="ticket-actions">
              {isEditingStatus ? (
                <div className="status-edit-container">
                  <div 
                    className="status-dropdown"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span>{selectedStatus}</span>
                    <ChevronDown size={16} />
                    {isDropdownOpen && (
                      <div className="status-dropdown-menu">
                        {statusOptions.map(status => (
                          <div
                            key={status}
                            className="status-option"
                            onClick={() => {
                              setSelectedStatus(status);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleStatusUpdate}
                    className="save-status-button"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingStatus(false);
                      setSelectedStatus(ticket.status);
                    }}
                    className="cancel-status-button"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="action-button status-button"
                  onClick={() => setIsEditingStatus(true)}
                >
                  <Edit3 size={16} />
                  Update Status
                </button>
              )}
              <button 
                className="action-button delete-button"
                onClick={() => onDelete(ticket)}
              >
                <Trash2 size={16} />
                Delete Ticket
              </button>
            </div>
          </div>

          {/* Subject */}
          <div className="ticket-subject-section">
            <h2 className="ticket-subject">{ticket.subject}</h2>
          </div>

          {/* Creator and Organization Info */}
          <div className="ticket-meta-section">
            <div className="meta-item">
              <User size={18} className="meta-icon" />
              <div className="meta-content">
                <span className="meta-label">Created By</span>
                <span className="meta-value">
                  {ticket.createdBy?.name || ticket.createdBy?.email || 'Unknown'}
                </span>
              </div>
            </div>
            
            <div className="meta-item">
              <Building size={18} className="meta-icon" />
              <div className="meta-content">
                <span className="meta-label">Organization</span>
                <span className="meta-value">
                  {ticket.organizationId?.name || 'Unknown Organization'}
                </span>
              </div>
            </div>
            
            <div className="meta-item">
              <Calendar size={18} className="meta-icon" />
              <div className="meta-content">
                <span className="meta-label">Created Date</span>
                <span className="meta-value">{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="ticket-description-section">
            <h3 className="section-title">
              <FileText size={18} />
              Description
            </h3>
            <div className="description-content">
              {ticket.description || 'No description provided'}
            </div>
          </div>

          {/* Error Message (if any) */}
          {ticket.errorMessage && (
            <div className="ticket-error-section">
              <h3 className="section-title">
                <AlertCircle size={18} />
                Error Message
              </h3>
              <div className="error-content">
                <pre>{ticket.errorMessage}</pre>
              </div>
            </div>
          )}

          {/* Attachments (if any) */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="ticket-attachments-section">
              <h3 className="section-title">
                <FileText size={18} />
                Attachments
              </h3>
              <div className="attachments-list">
                {ticket.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <div className="attachment-info">
                      <span className="attachment-name">{attachment.fileName || `File ${index + 1}`}</span>
                      <span className="attachment-size">{attachment.size || 'Unknown size'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update Section */}
          <div className="ticket-status-update-section">
            <h3 className="section-title">
              <CheckCircle size={18} />
              Status Management
            </h3>
            <div className="status-info">
              <div className="current-status">
                <span className="status-label">Current Status:</span>
                <span 
                  className="current-status-badge"
                  style={{ backgroundColor: statusColors.bg, color: statusColors.color }}
                >
                  {ticket.status}
                </span>
              </div>
              <p className="status-help">
                Click the "Update Status" button above to change the ticket status. 
                Allowed statuses: Open, In-Progress, Resolved
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
