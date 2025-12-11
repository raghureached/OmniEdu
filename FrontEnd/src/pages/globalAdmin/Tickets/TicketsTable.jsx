import React, { useEffect, useState } from "react";
import { Search, Plus, Calendar, Edit3, Trash2, FileText, CheckCircle, CheckCircle2, AlertCircle, Users, Shield, X, ArrowLeft } from "lucide-react";
import "./TicketsTable.css";
import "./TicketDetails.css";
import TicketDetails from "./TicketDetails";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchUserTickets,
    fetchUserTicketStats,
    updateUserTicketStatus,
    deleteUserTicket
} from "../../../store/slices/globalTicketSlice";
import {
    fetchAdminTickets,
    fetchAdminTicketStats,
    updateAdminTicketStatus,
    deleteAdminTicket
} from "../../../store/slices/globalTicketSlice";
import LoadingScreen from '../../../components/common/Loading/Loading';

const GlobalTicketsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("user"); // "user" or "admin"
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [adminPage, setAdminPage] = useState(1);
    const limit = 6;
    const dispatch = useDispatch();

    // In TicketsTable.jsx, update the selector
    const globalTickets = useSelector((state) => state.globalTickets || {
        user: {
            items: [],
            pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
            stats: { open: 0, resolved: 0, inProgress: 0 }
        },
        admin: {
            items: [],
            pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
            stats: { open: 0, resolved: 0, inProgress: 0 }
        },
        userLoading: false,
        adminLoading: false
    });

    useEffect(() => {
        dispatch(fetchUserTickets({ page: userPage, limit }));
        dispatch(fetchUserTicketStats());
    }, [dispatch, userPage]);

    useEffect(() => {
        dispatch(fetchAdminTickets({ page: adminPage, limit }));
        dispatch(fetchAdminTicketStats());
    }, [dispatch, adminPage]);

    const handleEditUserTicketStatus = async (ticket) => {
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

    const handleEditAdminTicketStatus = async (ticket) => {
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

    const handleDeleteUserTicket = async (ticket) => {
        const ok = window.confirm(`Delete user ticket ${ticket.ticketId}? This cannot be undone.`);
        if (!ok) return;
        await dispatch(deleteUserTicket(ticket.ticketId));
    };

    const handleDeleteAdminTicket = async (ticket) => {
        const ok = window.confirm(`Delete admin ticket ${ticket.ticketId}? This cannot be undone.`);
        if (!ok) return;
        await dispatch(deleteAdminTicket(ticket.ticketId));
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);
        setSelectedTicket(null);
    };

    const currentData = (activeTab === "user"
        ? globalTickets?.user
        : globalTickets?.admin) || {
        items: [],
        pagination: {
            page: 1,
            limit: 6,
            total: 0,
            totalPages: 1
        },
        stats: {
            open: 0,
            resolved: 0,
            inProgress: 0
        }
    };
    console.log("globalTickets", globalTickets);
    console.log("activeTab", activeTab, currentData);
    const currentPage = activeTab === "user" ? userPage : adminPage;
    const setCurrentPage = activeTab === "user" ? setUserPage : setAdminPage;
    const currentLoading = activeTab === "user"
        ? globalTickets?.userLoading
        : globalTickets?.adminLoading || false;

    if (showDetails && selectedTicket) {
        return (
            <div className="ticket-details-container">
                <TicketDetails
                    ticket={selectedTicket}
                    onClose={closeDetails}
                    onStatusUpdate={activeTab === "user" ? handleEditUserTicketStatus : handleEditAdminTicketStatus}
                    onDelete={activeTab === "user" ? handleDeleteUserTicket : handleDeleteAdminTicket}
                    ticketType={activeTab}
                />
            </div>
        );
    }

    if (currentLoading && (!currentData.items || currentData.items.length === 0)) {
        return <LoadingScreen text="Loading Tickets..." />;
    }

    return (
        <div className="support-container">
            {/* ------------ Header ------------ */}
            <div className="support-header">
                <div className="support-header-content">
                    <div>
                        <h1 className="support-title">Global Support Tickets</h1>
                        <p className="support-subtitle">View and manage all user and admin support tickets</p>
                    </div>

                    {/* === TAB SWITCHER === */}
                    <div className="ticket-stats">
                        <div className="ticket-stat-card">
                            <div className="ticket-stat-icon open">
                                <FileText size={20} />
                            </div>
                            <div className="ticket-stat-info">
                                <span className="ticket-stat-number">
                                    {currentData.stats.open}
                                </span>
                                <span className="ticket-stat-label">
                                    {activeTab === "user" ? "User" : "Admin"} Open Tickets
                                </span>
                            </div>
                        </div>

                        <div className="ticket-stat-card">
                            <div className="ticket-stat-icon resolved">
                                <CheckCircle size={20} />
                            </div>
                            <div className="ticket-stat-info">
                                <span className="ticket-stat-number">
                                    {currentData.stats.resolved}
                                </span>
                                <span className="ticket-stat-label">
                                    {activeTab === "user" ? "User" : "Admin"} Resolved
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* === STAT CARDS === */}
            

            {/* ------------ Search Bar ------------ */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div className="support-search-section">
                <div className="support-search">
                    <Search size={16} className="support-search-icon" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab} tickets by subject`}
                        className="support-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px"}}>
                <button
                    className={`tab-button ${activeTab === "user" ? "active" : ""}`}
                    onClick={() => setActiveTab("user")}
                >
                    <Users size={16} />
                    User Tickets
                </button>
                <button
                    className={`tab-button ${activeTab === "admin" ? "active" : ""}`}
                    onClick={() => setActiveTab("admin")}
                >
                    <Shield size={16} />
                    Admin Tickets
                </button>
            </div>
            </div>

            {/* ------------ Tickets Table ------------ */}
            <div className="support-table-section">
                {currentData.items.length === 0 && !currentLoading ? (
                    <div className="ticket-empty-state">
                        <div className="ticket-empty-icon">
                            {activeTab === "user" ? <Users size={48} /> : <Shield size={48} />}
                        </div>
                        <h3>No {activeTab} tickets found</h3>
                        <p>
                            {activeTab === "user"
                                ? "No user support tickets have been created yet"
                                : "No admin support tickets have been created yet"}
                        </p>
                    </div>
                ) : (
                    <table className="support-table">
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Ticket Details</th>
                                <th>Created By</th>
                                <th>Status</th>
                                <th>Date Created</th>
                                {/* <th>Actions</th> */}
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.items
                                .filter((t) =>
                                    t.subject.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((ticket) => (
                                    <tr
                                        key={ticket.ticketId}
                                        className="support-row"
                                        onClick={() => handleTicketClick(ticket)}
                                        style={{ cursor: 'pointer' }}
                                    >
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
                                            <div className="ticket-creator">
                                                <span className="creator-name">
                                                    {ticket.createdBy?.name || ticket.createdBy?.email || 'Unknown'}
                                                </span>
                                                <span className="creator-org">
                                                    {ticket.organizationId?.name || 'Unknown Org'}
                                                </span>
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

                                        {/* ACTIONS */}
                                        {/* <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                                            <div className="actions-wrapper">
                                                <button
                                                    className="tickets-action-btn edit"
                                                    title="Edit Status"
                                                    onClick={() => activeTab === "user"
                                                        ? handleEditUserTicketStatus(ticket)
                                                        : handleEditAdminTicketStatus(ticket)}
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    className="tickets-action-btn delete"
                                                    title="Delete Ticket"
                                                    onClick={() => activeTab === "user"
                                                        ? handleDeleteUserTicket(ticket)
                                                        : handleDeleteAdminTicket(ticket)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td> */}
                                    </tr>
                                ))}
                        </tbody>

                        {/* PAGINATION ROW */}
                        <tr className="support-pagination-row">
                            <td colSpan={6}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                    padding: "16px 0",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        {/* Prev Button */}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage <= 1 || currentLoading}
                                            style={{
                                                padding: "6px 10px",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 6,
                                                background: "#fff",
                                                color: "#0f172a",
                                                cursor: currentPage <= 1 || currentLoading ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            Prev
                                        </button>

                                        {/* Page X of Y */}
                                        <span style={{ color: "#0f172a" }}>
                                            {(() => {
                                                const totalPages = Math.max(
                                                    1,
                                                    Math.ceil((currentData.pagination?.total || 0) / (currentData.pagination?.limit || 1))
                                                );
                                                return `Page ${currentPage} of ${totalPages}`;
                                            })()}
                                        </span>

                                        {/* Next Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const totalPages = Math.max(
                                                    1,
                                                    Math.ceil((currentData.pagination?.total || 0) / (currentData.pagination?.limit || 1))
                                                );
                                                setCurrentPage((p) => Math.min(totalPages, p + 1));
                                            }}
                                            disabled={
                                                currentLoading ||
                                                (currentData.pagination &&
                                                    currentPage >=
                                                    Math.max(
                                                        1,
                                                        Math.ceil((currentData.pagination.total || 0) / (currentData.pagination.limit || 1))
                                                    ))
                                            }
                                            style={{
                                                padding: "6px 10px",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 6,
                                                background: "#fff",
                                                color: "#0f172a",
                                                cursor:
                                                    currentLoading ||
                                                        (currentData.pagination &&
                                                            currentPage >=
                                                            Math.max(
                                                                1,
                                                                Math.ceil((currentData.pagination.total || 0) / (currentData.pagination.limit || 1))
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
                    </table>
                )}
            </div>
        </div>
    );
};

export default GlobalTicketsTable;