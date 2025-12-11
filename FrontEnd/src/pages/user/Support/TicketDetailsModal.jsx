import React, { useState, useEffect } from 'react';
import { X, Calendar, User, MessageSquare, Paperclip, Send, AlertCircle, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserTicketDetails, addUserTicketComment, clearCurrentTicket } from '../../../store/slices/userTicketsSlice';

export default function TicketDetailsModal({ ticketId, onClose }) {
  const dispatch = useDispatch();
  const { currentTicket: ticket, detailsLoading, commentSending, error } = useSelector(state => state.userTickets);
  const [comment, setComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchUserTicketDetails(ticketId));
    }
    
    return () => {
      dispatch(clearCurrentTicket());
    };
  }, [ticketId, dispatch]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB'
    }));
    setCommentAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setCommentAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendComment = async () => {
    if (!comment.trim() && commentAttachments.length === 0) return;
    
    try {
      await dispatch(addUserTicketComment({ 
        ticketId, 
        message: comment, 
        attachments: commentAttachments 
      })).unwrap();
      setComment('');
      setCommentAttachments([]);
    } catch (err) {
      console.error('Failed to send comment:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#d97706';
      case 'in-progress': return '#0284c7';
      case 'resolved': return '#059669';
      default: return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (detailsLoading) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#1c88c7',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', margin: 0 }}>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <div style={{
          background: '#fff',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', margin: 0 }}>Failed to load ticket details</p>
          <button onClick={onClose} style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#1c88c7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .comment-textarea:focus {
          outline: none;
          border-color: #1c88c7;
          box-shadow: 0 0 0 3px rgba(28, 136, 199, 0.1);
        }
        .send-btn:hover:not(:disabled) {
          background: #0369a1;
          transform: translateY(-1px);
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}>
        <div style={{
          background: '#fff',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)',
            padding: '24px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            position: 'relative'
          }}>
            <button onClick={onClose} style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
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
            }}>
              <X size={20} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: '700',
                color: '#fff',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '6px'
              }}>
                #{ticket.ticketId}
              </span>
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: 'rgba(255,255,255,0.9)',
                color: getStatusColor(ticket.status)
              }}>
                {ticket.status}
              </span>
            </div>
            
            <h2 style={{
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              margin: '0 0 12px 0'
            }}>
              {ticket.subject}
            </h2>
            
            <div style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} />
                <span>Created: {formatDate(ticket.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                <span>Updated: {formatDate(ticket.updatedAt)}</span>
              </div>
              {ticket.assignedTo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <span>Assigned to: {ticket.assignedTo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px'
          }}>
            {/* Ticket Details Section */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Issue Description
              </h3>
              <p style={{
                color: '#1e293b',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: '0 0 16px 0',
                whiteSpace: 'pre-wrap'
              }}>
                {ticket.description}
              </p>
              
              {ticket.errorMessage && (
                <>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '16px 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Error Message
                  </h3>
                  <pre style={{
                    background: '#1e293b',
                    color: '#e2e8f0',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    overflow: 'auto',
                    margin: '0'
                  }}>
                    {ticket.errorMessage}
                  </pre>
                </>
              )}
              
              {ticket.attachments.length > 0 && (
                <>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '16px 0 8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Attachments
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ticket.attachments.map((file, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#fff',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <Paperclip size={16} color="#64748b" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                            {file.fileName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {file.size}
                          </div>
                        </div>
                        {/* <a href={file.url} style={{
                          color: '#1c88c7',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none'
                        }}>
                          Download
                        </a> */}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Conversation Thread */}
            {/* <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MessageSquare size={18} />
                Conversation
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ticket.conversation.map((msg) => (
                  <div key={msg.id} style={{
                    display: 'flex',
                    flexDirection: msg.sender === 'Admin' ? 'row-reverse' : 'row',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: msg.sender === 'Admin' ? '#1c88c7' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {"Y"}
                    </div>
                    
                    <div style={{
                      flex: 1,
                      maxWidth: '70%'
                    }}>
                      <div style={{
                        background: msg.sender === 'Admin' ? '#e0f2fe' : '#f1f5f9',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        borderTopRightRadius: msg.sender === 'Admin' ? '4px' : '12px',
                        borderTopLeftRadius: msg.sender === 'Admin' ? '12px' : '4px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#475569',
                          marginBottom: '6px'
                        }}>
                          {"YOU"}
                          <span style={{ fontWeight: '400', marginLeft: '8px', color: '#94a3b8' }}>
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                        <p style={{
                          color: '#1e293b',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          margin: 0,
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.message}
                        </p>
                        
                        {msg.attachments.length > 0 && (
                          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {msg.attachments.map((file, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 10px',
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}>
                                <Paperclip size={12} />
                                <span style={{ flex: 1 }}>{file.name||"hello"}</span>
                                
                                <span style={{ color: '#64748b' }}>{file.size}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          {/* Comment Input */}
          {/* <div style={{
            borderTop: '1px solid #e2e8f0',
            padding: '20px 24px',
            background: '#f8fafc'
          }}>
            <textarea
              className="comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your reply..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
            
            {commentAttachments.length > 0 && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {commentAttachments.map((file, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}>
                    <Paperclip size={12} />
                    <span>{file.name}</span>
                    <span style={{ color: '#64748b' }}>({file.size})</span>
                    <button onClick={() => removeAttachment(idx)} style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '2px'
                    }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#1c88c7',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                <Paperclip size={16} />
                Attach File
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt"
                />
              </label>
              
              <button
                className="send-btn"
                onClick={handleSendComment}
                disabled={(!comment.trim() && commentAttachments.length === 0) || commentSending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#1c88c7',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                <Send size={16} />
                {commentSending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}