const UserTicket = require("../../models/userTickets");
const AdminTicket = require("../../models/adminTicket");
const logUserActivity = require("../admin.controller/admin_activity");

// User Tickets APIs for Global Admin

// Get all user tickets for global admin with pagination
const getGlobalUserTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Get all user tickets (global admin can see all)
    const tickets = await UserTicket.find({})
      .populate('createdBy', 'name email')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserTicket.countDocuments({});

    await logUserActivity(req, "VIEW_GLOBAL_USER_TICKETS", `Viewed ${tickets.length} global user tickets`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global user tickets fetched successfully",
      data: tickets,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching global user tickets:", error);
    await logUserActivity(req, "VIEW_GLOBAL_USER_TICKETS", "Failed to fetch global user tickets", "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch global user tickets",
      error: error.message
    });
  }
};

// Update user ticket status (global admin)
const updateGlobalUserTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["Open", "In-Progress", "Resolved"].includes(status)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid status. Must be Open, In-Progress, or Resolved"
      });
    }

    const ticket = await UserTicket.findOneAndUpdate(
      { ticketId },
      { status },
      { new: true }
    ).populate('createdBy', 'name email').populate('organizationId', 'name');
    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "UPDATE_GLOBAL_USER_TICKET_STATUS", `Updated global user ticket ${ticketId} status to ${status}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global user ticket status updated successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error updating global user ticket status:", error);
    await logUserActivity(req, "UPDATE_GLOBAL_USER_TICKET_STATUS", `Failed to update global user ticket status: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to update global user ticket status",
      error: error.message
    });
  }
};

// Delete user ticket (global admin)
const deleteGlobalUserTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await UserTicket.findOneAndDelete({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "DELETE_GLOBAL_USER_TICKET", `Deleted global user ticket ${ticketId}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global user ticket deleted successfully",
      data: ticketId
    });
  } catch (error) {
    console.error("Error deleting global user ticket:", error);
    await logUserActivity(req, "DELETE_GLOBAL_USER_TICKET", `Failed to delete global user ticket: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to delete global user ticket",
      error: error.message
    });
  }
};

// Update user ticket details (global admin)
const updateGlobalUserTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { subject, description, errorMessage, attachments } = req.body;

    const ticket = await UserTicket.findOneAndUpdate(
      { ticketId },
      { subject, description, errorMessage, attachments },
      { new: true }
    ).populate('createdBy', 'name email').populate('organizationId', 'name');

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "UPDATE_GLOBAL_USER_TICKET", `Updated global user ticket ${ticketId}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global user ticket updated successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error updating global user ticket:", error);
    await logUserActivity(req, "UPDATE_GLOBAL_USER_TICKET", `Failed to update global user ticket: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to update global user ticket",
      error: error.message
    });
  }
};

// Get global user ticket statistics
const getGlobalUserTicketStats = async (req, res) => {
  try {
    const open = await UserTicket.countDocuments({ status: "Open" });
    const resolved = await UserTicket.countDocuments({ status: "Resolved" });
    const inProgress = await UserTicket.countDocuments({ status: "In-Progress" });

    const result = { open, inProgress, resolved };

    return res.status(200).json({
      isSuccess: true,
      message: "Global user ticket statistics fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching global user ticket stats:", error);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch global user ticket statistics",
    });
  }
};

// Admin Tickets APIs for Global Admin

// Get all admin tickets for global admin with pagination
const getGlobalAdminTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Get all admin tickets (global admin can see all)
    const tickets = await AdminTicket.find({})
      .populate('createdBy', 'name email')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminTicket.countDocuments({});

    await logUserActivity(req, "VIEW_GLOBAL_ADMIN_TICKETS", `Viewed ${tickets.length} global admin tickets`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global admin tickets fetched successfully",
      data: tickets,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching global admin tickets:", error);
    await logUserActivity(req, "VIEW_GLOBAL_ADMIN_TICKETS", "Failed to fetch global admin tickets", "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch global admin tickets",
      error: error.message
    });
  }
};

// Update admin ticket status (global admin)
const updateGlobalAdminTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["Open", "In-Progress", "Resolved"].includes(status)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid status. Must be Open, In-Progress, or Resolved"
      });
    }

    const ticket = await AdminTicket.findOneAndUpdate(
      { ticketId },
      { status },
      { new: true }
    ).populate('createdBy', 'name email').populate('organizationId', 'name');

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "UPDATE_GLOBAL_ADMIN_TICKET_STATUS", `Updated global admin ticket ${ticketId} status to ${status}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global admin ticket status updated successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error updating global admin ticket status:", error);
    await logUserActivity(req, "UPDATE_GLOBAL_ADMIN_TICKET_STATUS", `Failed to update global admin ticket status: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to update global admin ticket status",
      error: error.message
    });
  }
};

// Delete admin ticket (global admin)
const deleteGlobalAdminTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await AdminTicket.findOneAndDelete({ ticketId });

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "DELETE_GLOBAL_ADMIN_TICKET", `Deleted global admin ticket ${ticketId}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global admin ticket deleted successfully",
      data: ticketId
    });
  } catch (error) {
    console.error("Error deleting global admin ticket:", error);
    await logUserActivity(req, "DELETE_GLOBAL_ADMIN_TICKET", `Failed to delete global admin ticket: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to delete global admin ticket",
      error: error.message
    });
  }
};

// Update admin ticket details (global admin)
const updateGlobalAdminTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { subject, description, errorMessage, attachments } = req.body;

    const ticket = await AdminTicket.findOneAndUpdate(
      { ticketId },
      { subject, description, errorMessage, attachments },
      { new: true }
    ).populate('createdBy', 'name email').populate('organizationId', 'name');

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "UPDATE_GLOBAL_ADMIN_TICKET", `Updated global admin ticket ${ticketId}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Global admin ticket updated successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error updating global admin ticket:", error);
    await logUserActivity(req, "UPDATE_GLOBAL_ADMIN_TICKET", `Failed to update global admin ticket: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to update global admin ticket",
      error: error.message
    });
  }
};

// Get global admin ticket statistics
const getGlobalAdminTicketStats = async (req, res) => {
  try {
    const open = await AdminTicket.countDocuments({ status: "Open" });
    const resolved = await AdminTicket.countDocuments({ status: "Resolved" });
    const inProgress = await AdminTicket.countDocuments({ status: "In-Progress" });

    const result = { open, inProgress, resolved };

    return res.status(200).json({
      isSuccess: true,
      message: "Global admin ticket statistics fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching global admin ticket stats:", error);
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch global admin ticket statistics",
    });
  }
};

module.exports = {
  // User Tickets
  getGlobalUserTickets,
  updateGlobalUserTicketStatus,
  deleteGlobalUserTicket,
  updateGlobalUserTicket,
  getGlobalUserTicketStats,
  
  // Admin Tickets
  getGlobalAdminTickets,
  updateGlobalAdminTicketStatus,
  deleteGlobalAdminTicket,
  updateGlobalAdminTicket,
  getGlobalAdminTicketStats
};