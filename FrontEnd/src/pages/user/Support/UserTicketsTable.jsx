import React, { useEffect, useState } from "react";
import { Search, Plus, Calendar,Edit3, Trash2,FileText, CheckCircle, CheckCircle2, AlertCircle } from "lucide-react";
import "./UserTicketsTable.css";
import SupportTicketRaiser from "./UserSupportTicket"; // popup component
import { useDispatch, useSelector } from "react-redux";
import { fetchUserTickets, updateUserTicketStatus, deleteUserTicket, fetchUserTicketStats } from "../../../store/slices/userTicketsSlice";

import LoadingScreen from '../../../components/common/Loading/Loading';
const UserTicketsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 6;
  const dispatch = useDispatch();
  const { items: tickets, loading, error, pagination, stats } = useSelector((s) => s.userTickets);


  useEffect(() => {
    dispatch(fetchUserTickets({ page, limit }));
    dispatch(fetchUserTicketStats());
  }, [dispatch, page]);
  
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
    await dispatch(updateUserTicketStatus({ ticketId: ticket.ticketId, status }));
  };

  const handleDelete = async (ticket) => {
    const ok = window.confirm(`Delete ticket ${ticket.ticketId}? This cannot be undone.`);
    if (!ok) return;
    await dispatch(deleteUserTicket(ticket.ticketId));
  };

  const openEditForm = (ticket) => {
    setSelectedTicket(ticket);
    setShowPopup(true);
  };

  const closeModal = () => {
    setShowPopup(false);
    setSelectedTicket(null);
  };

  const handleTicketSubmitSuccess = (ticketId) => {
    setCreatedTicketId(ticketId);
    setShowSuccess(true);
    setShowPopup(false);
    // Refresh tickets list and stats
    dispatch(fetchUserTickets({ page, limit }));
    dispatch(fetchUserTicketStats());
    // Auto-hide success message after 10 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setCreatedTicketId(null);
    }, 10000);
  };
 if (loading) {
    return <LoadingScreen text="Loading Tickets..." />
  }
  return (
    <div className="user-support-container">
      {/* ------------ Header ------------ */}
      <div className="user-support-header">
        <div className="user-support-header-content">
          <div>
            <h1 className="user-support-title">Support Tickets</h1>
            <p className="user-support-subtitle">View and manage user support tickets</p>
          </div>
          {/* === STAT CARDS === */}
  <div className="user-ticket-stats">
    <div className="user-ticket-stat-card">
      <div className="user-ticket-stat-icon open">
        <FileText size={20} />
      </div>
      <div className="user-ticket-stat-info">
        <span className="user-ticket-stat-number">
          {stats.open}
        </span>
        <span className="user-ticket-stat-label">Open Tickets</span>
      </div>
    </div>

    <div className="user-ticket-stat-card">
      <div className="user-ticket-stat-icon resolved">
        <CheckCircle size={20} />
      </div>
      <div className="user-ticket-stat-info">
        <span className="user-ticket-stat-number">
          {stats.resolved}
        </span>
        <span className="user-ticket-stat-label">Resolved</span>
      </div>
    </div>
  </div>



        </div>
      </div>

      {/* ------------ Search Bar ------------ */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
       
      }} >
        <div className="user-support-search" >
          <Search size={16} className="user-support-search-icon" />
          <input
            type="text"
            placeholder="Search tickets by subject"
            className="user-support-search-input"
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


      {/* ------------ Tickets Table ------------ */}
      <div className="user-support-table-section">


        {/* {loading && <div style={{ padding: 12 }}>Loading tickets...</div>}
        {error && (
          <div style={{ padding: 12, color: 'crimson' }}>Error: {error}</div>
        )} */}
        {/* EMPTY STATE */}
  {tickets.length === 0 && !loading ? (
    <div className="user-ticket-empty-state">
      <div className="user-ticket-empty-icon"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg></div>
      <h3>No tickets found</h3>
      <p>Start by creating your first support ticket</p>
      <button className="btn-primary" style={{justifySelf:'center'}} onClick={() => setShowPopup(true)}>
        <Plus size={16} />
        Add Ticket
      </button>
    </div>
  ) : (
        <table className="user-support-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Ticket Details</th>
              <th>Status</th>
              <th>Date Created</th>
              {/* <th>Actions</th> */}
            </tr>
            
          </thead>

          <tbody>
            {tickets
              .filter((t) =>
                t.subject.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((ticket) => (
                <tr key={ticket.ticketId} className="user-support-row">
                  <td>
                    <span className="user-ticket-id-display">#{ticket.ticketId}</span>
                  </td>
                  <td>
                    <div className="user-support-cell">
                      <h4 className="user-support-ticket-title">
                        {ticket.subject.length > 50 
                          ? `${ticket.subject.substring(0, 50)}...` 
                          : ticket.subject}
                      </h4>
                      <p className="user-support-ticket-description">
                        {ticket.description.length > 150 
                          ? `${ticket.description.substring(0, 150)}...` 
                          : ticket.description}
                      </p>
                    </div>
                  </td>

                  <td>
                    <span className={`user-support-badge ${ticket.status.toLowerCase()}`}>
                      {ticket.status}
                    </span>
                  </td>

                  <td>
                    <div className="user-support-date">
                      <Calendar size={14} />
                      <span>
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString("en-US") : "-"}
                      </span>
                    </div>
                  </td>
                  {/* ACTIONS */}
              {/* <td className="col-actions">
                <div className="actions-wrapper">
                  <button
                    className="tickets-action-btn edit"
                    title="Edit Ticket"
                    onClick={() => openEditForm(ticket)}
                  >
                    <Edit3 size={14} />
                  </button>

                  <button
                    className="tickets-action-btn delete"
                    title="Delete Ticket"
                    onClick={() => handleDelete(ticket)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td> */}
                </tr>
              ))}
          </tbody>
          {/* ============== PAGINATION ROW (ADD THIS) ============== */}
<tr className="user-tickets-pagination-row">
  <td colSpan={4}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        padding: "16px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        
        {/* Prev Button */}
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

        {/* Page X of Y */}
        <span style={{ color: "#0f172a" }}>
          {(() => {
            const totalPages = Math.max(
              1,
              Math.ceil((pagination?.total || 0) / (pagination?.limit || 1))
            );
            return `Page ${page} of ${totalPages}`;
          })()}
        </span>

        {/* Next Button */}
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

        </table>)}
      </div>

      {/* ------------ SUCCESS POPUP ------------ */}
      {showSuccess && (
        <div className="user-support-popup-overlay">
          <div className="user-support-popup-container success-popup">
            <button
              className="user-support-popup-close"
              onClick={() => setShowSuccess(false)}
            >
              ×
            </button>
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
              <div className="success-details">
                <p className="success-details-title">
                  <AlertCircle style={{ width: 16, height: 16 }} />
                  What happens next?
                </p>
                <ul className="success-details-list">
                  <li>Support team receives your ticket</li>
                  <li>Priority assessment within 1 hour</li>
                  <li>Initial response based on priority level</li>
                  <li>Regular updates until resolution</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------ POPUP MODAL FOR ADD TICKET ------------ */}
      {showPopup && (
        <div className="user-support-popup-overlay">
          <div className="user-support-popup-container">
            <button
              className="user-support-popup-close"
              onClick={() => setShowPopup(false)}
            >
              ×
            </button>

            <SupportTicketRaiser 
              onClose={closeModal} 
              ticket={selectedTicket} 
              onSuccess={handleTicketSubmitSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTicketsTable;
