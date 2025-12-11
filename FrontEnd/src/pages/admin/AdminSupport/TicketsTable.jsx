import React, { useEffect, useState } from "react";
import { Search, Plus, Calendar, Edit3, Trash2, FileText, CheckCircle2, Eye,X,CheckCircle } from "lucide-react";
import "./TicketsTable.css";
import './SupportTicket.css';
import SupportTicketRaiser from "./SupportTicket";
import TicketDetailsModal from "./TicketDetailsModal"; // NEW IMPORT
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchAdminTickets, 
  updateAdminTicketStatus, 
  deleteAdminTicket, 
  fetchAdminTicketStats,
  clearCurrentTicket // NEW
} from "../../../store/slices/adminTicketsSlice";
import LoadingScreen from '../../../components/common/Loading/Loading';

const TicketsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // NEW
  const [selectedTicketId, setSelectedTicketId] = useState(null); // NEW
  const [page, setPage] = useState(1);
  const limit = 6;
  
  const dispatch = useDispatch();
  const { items: tickets, loading, error, pagination, stats } = useSelector((s) => s.adminTickets);

  useEffect(() => {
    dispatch(fetchAdminTickets({ page, limit }));
    dispatch(fetchAdminTicketStats());
  }, [dispatch, page]);

  // Debug logging for stats
  console.log('Stats data:', stats);
  console.log('Error state:', error);

  const handleEditStatus = async (ticket) => {
    const current = ticket.status;
    const input = window.prompt(
      `Update status for ${ticket.ticketId} (allowed: Open, In-Progress, Resolved)`,
      current
    );
    if (!input) return;
    const status = input.trim();
    const allowed = ["Open", "In-Progress", "Resolved"];
    if (!allowed.includes(status)) {
      alert("Invalid status. Use: Open, In-Progress, Resolved");
      return;
    }
    await dispatch(updateAdminTicketStatus({ ticketId: ticket.ticketId, status }));
  };

  const handleDelete = async (ticket) => {
    // Only allow delete if status is "Open"
    if (ticket.status !== "Open") {
      alert("You can only delete tickets with 'Open' status.");
      return;
    }
    const ok = window.confirm(`Delete ticket ${ticket.ticketId}? This cannot be undone.`);
    if (!ok) return;
    await dispatch(deleteAdminTicket(ticket.ticketId));
  };

  const openEditForm = (ticket) => {
    // Only allow edit if status is "Open"
    if (ticket.status !== "Open") {
      alert("You can only edit tickets with 'Open' status.");
      return;
    }
    setSelectedTicket(ticket);
    setShowPopup(true);
  };

  // NEW: Open ticket details modal
  const openTicketDetails = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowDetailsModal(true);
  };

  // NEW: Close ticket details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTicketId(null);
    dispatch(clearCurrentTicket());
  };

  const closeModal = () => {
    setShowPopup(false);
    setSelectedTicket(null);
  };

  const handleTicketSubmitSuccess = (ticketId) => {
    setCreatedTicketId(ticketId);
    setShowSuccess(true);
    setShowPopup(false);
    dispatch(fetchAdminTickets({ page, limit }));
    dispatch(fetchAdminTicketStats());
    setTimeout(() => {
      setShowSuccess(false);
      setCreatedTicketId(null);
    }, 10000);
  };

  if (loading) {
    return <LoadingScreen text="Loading Tickets..." />
  }

  return (
    <div className="support-container">
      {/* Header */}
      <div className="support-header">
        <div className="support-header-content">
          <div>
            <h1 className="support-title">Support Tickets</h1>
            <p className="support-subtitle">View and manage user support tickets</p>
          </div>
          
          {/* Stat Cards */}
          <div className="ticket-stats">
            <div className="ticket-stat-card">
              <div className="ticket-stat-icon open">
                <FileText size={20} />
              </div>
              <div className="ticket-stat-info">
                <span className="ticket-stat-number">{stats.open}</span>
                <span className="ticket-stat-label">Open Tickets</span>
              </div>
            </div>

            <div className="ticket-stat-card">
              <div className="ticket-stat-icon resolved">
                <CheckCircle size={20} />
              </div>
              <div className="ticket-stat-info">
                <span className="ticket-stat-number">{stats.resolved}</span>
                <span className="ticket-stat-label">Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Add Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}>
        <div className="support-search">
          <Search size={16} className="support-search-icon" />
          <input
            type="text"
            placeholder="Search tickets"
            className="support-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <button className="btn-primary" onClick={() => { setSelectedTicket(null); setShowPopup(true); }}>
            <Plus size={16} />
            Add Ticket
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="support-table-section">
        {tickets.length === 0 && !loading ? (
          <div className="ticket-empty-state">
            <div className="ticket-empty-icon">
              <FileText size={48} />
            </div>
            <h3>No tickets found</h3>
            <p>Start by creating your first support ticket</p>
            <button className="btn-primary" style={{ justifySelf: 'center' }} onClick={() => setShowPopup(true)}>
              <Plus size={16} />
              Add Ticket
            </button>
          </div>
        ) : (
          <table className="support-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Ticket Details</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tickets
                .filter((t) => t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((ticket) => (
                  <tr key={ticket.ticketId} className="support-row">
                    <td>
                      <span className="ticket-id-display">#{ticket.ticketId}</span>
                    </td>
                    <td>
                      <div className="support-cell">
                        <h4 className="support-ticket-title">
                          {ticket.subject.length > 50 
                            ? `${ticket.subject.substring(0, 50)}...` 
                            : ticket.subject}
                        </h4>
                        <p className="support-ticket-description">
                          {ticket.description.length > 150 
                            ? `${ticket.description.substring(0, 150)}...` 
                            : ticket.description}
                        </p>
                      </div>
                    </td>

                    <td>
                      <span className={`support-badge ${ticket.status.toLowerCase()}`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      <div className="support-date">
                        <Calendar size={14} />
                        <span>
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-US") : "-"}
                        </span>
                      </div>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="col-actions">
                      <div className="actions-wrapper">
                        {/* View Details Button - ALWAYS VISIBLE */}
                        <button
                          className="tickets-action-btn view"
                          title="View Details"
                          onClick={() => openTicketDetails(ticket.ticketId)}
                        >
                          <Eye size={14} />
                        </button>

                        {/* Edit Button - Only for "Open" status */}
                        {ticket.status === "Open" && (
                          <button
                            className="tickets-action-btn edit"
                            title="Edit Ticket"
                            onClick={() => openEditForm(ticket)}
                          >
                            <Edit3 size={14} />
                          </button>
                        )}

                        {/* Delete Button - Only for "Open" status */}
                        {/* {ticket.status === "Open" && (
                          <button
                            className="tickets-action-btn delete"
                            title="Delete Ticket"
                            onClick={() => handleDelete(ticket)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))}
                
              {/* Pagination Row */}
              <tr className="tickets-pagination-row">
                <td colSpan={5}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "16px 0",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || loading}
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          background: "#fff",
                          color: "#0f172a",
                          cursor: page <= 1 || loading ? "not-allowed" : "pointer",
                        }}
                      >
                        Prev
                      </button>

                      <span style={{ color: "#0f172a" }}>
                        {(() => {
                          const totalPages = Math.max(
                            1,
                            Math.ceil((pagination?.total || 0) / (pagination?.limit || 1))
                          );
                          return `Page ${page} of ${totalPages}`;
                        })()}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const totalPages = Math.max(
                            1,
                            Math.ceil((pagination?.total || 0) / (pagination?.limit || 1))
                          );
                          setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        disabled={
                          loading ||
                          (pagination &&
                            page >=
                              Math.max(
                                1,
                                Math.ceil((pagination.total || 0) / (pagination.limit || 1))
                              ))
                        }
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          background: "#fff",
                          color: "#0f172a",
                          cursor:
                            loading ||
                            (pagination &&
                              page >=
                                Math.max(
                                  1,
                                  Math.ceil((pagination.total || 0) / (pagination.limit || 1))
                                ))
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="support-popup-overlay">
          <div className="support-popup-container success-popup">
            <button className="support-popup-close" onClick={() => setShowSuccess(false)}><X size={20}/></button>
            <div className="success-container">
              <div className="success-icon">
                <CheckCircle2 className="icon-large" />
              </div>
              <h2 className="success-title">Ticket Submitted Successfully!</h2>
              <div className="success-ticket-id">
                <span className="ticket-id-label">Your Ticket ID</span>
                <div>
                  <span className="ticket-id-value">#{createdTicketId || `TKT-${Math.floor(Math.random() * 10000)}`}</span>
                </div>
              </div>
              <p className="success-message">
                Our support team will review your ticket and respond within 24 hours. You'll receive email notifications for any updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Ticket Popup */}
      {showPopup && (
        <div className="support-popup-overlay">
          <div className="support-popup-container">
            {/* <button className="support-popup-close" onClick={() => setShowPopup(false)}>×</button> */}
            <SupportTicketRaiser 
              onClose={closeModal} 
              ticket={selectedTicket} 
              onSuccess={handleTicketSubmitSuccess}
            />
          </div>
        </div>
      )}

      {/* NEW: Ticket Details Modal */}
      {showDetailsModal && selectedTicketId && (
        <TicketDetailsModal 
          ticketId={selectedTicketId}
          onClose={closeDetailsModal}
        />
      )}
    </div>
  );
};

export default TicketsTable;