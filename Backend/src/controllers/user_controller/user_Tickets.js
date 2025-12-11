const UserTicket = require("../../models/userTickets");
const logUserActivity = require("./user_activity");
const mongoose = require("mongoose");

// Get all tickets for the authenticated user with pagination
const getTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    // Get tickets for the user's organization, created by this user
    const tickets = await UserTicket.find({
      organizationId: req.user.organization_id,
      createdBy: req.user._id
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await UserTicket.countDocuments({
      organizationId: req.user.organization_id,
      createdBy: req.user._id
    });

    await logUserActivity(req, "VIEW_TICKETS", `Viewed ${tickets.length} tickets`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Tickets fetched successfully",
      data: tickets,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    await logUserActivity(req, "VIEW_TICKETS", "Failed to fetch tickets", "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch tickets",
      error: error.message
    });
  }
};

// Create a new ticket
const createTicket = async (req, res) => {
  try {
    const { subject, description, errorMessage, attachments } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        isSuccess: false,
        message: "Subject and description are required"
      });
    }

    const ticketData = {
      organizationId: req.user.organization_id,
      createdBy: req.user._id,
      subject,
      description,
      errorMessage: errorMessage || "",
      attachments: attachments || []
    };

    const ticket = await UserTicket.create(ticketData);

    await logUserActivity(req, "CREATE_TICKET", `Created ticket: ${ticket.ticketId}`, "success");

    res.status(201).json({
      isSuccess: true,
      message: "Ticket created successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    await logUserActivity(req, "CREATE_TICKET", "Failed to create ticket", "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to create ticket",
      error: error.message
    });
  }
};

// Update ticket status
const updateTicketStatus = async (req, res) => {
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
      {
        ticketId,
        organizationId: req.user.organization_id,
        createdBy: req.user._id
      },
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "UPDATE_TICKET_STATUS", `Updated ticket ${ticketId} status to ${status}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Ticket status updated successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    await logUserActivity(req, "UPDATE_TICKET_STATUS", `Failed to update ticket status: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to update ticket status",
      error: error.message
    });
  }
};

// Update ticket details
const updateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { subject, description, errorMessage, attachments } = req.body;

    if (!subject && !description && errorMessage === undefined && !attachments) {
      return res.status(400).json({
        isSuccess: false,
        message: "At least one field must be provided for update"
      });
    }

    const updateData = {};
    if (subject) updateData.subject = subject;
    if (description) updateData.description = description;
    if (errorMessage !== undefined) updateData.errorMessage = errorMessage;
    if (attachments) updateData.attachments = attachments;

    const ticket = await UserTicket.findOneAndUpdate(
      {
        ticketId,
        organizationId: req.user.organization_id,
        createdBy: req.user._id
      },
      updateData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "UPDATE_TICKET", `Updated ticket: ${ticketId}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Ticket updated successfully",
      data: ticket
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    await logUserActivity(req, "UPDATE_TICKET", `Failed to update ticket: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to update ticket",
      error: error.message
    });
  }
};

// Delete a ticket
const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await UserTicket.findOneAndDelete({
      ticketId,
      organizationId: req.user.organization_id,
      createdBy: req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found"
      });
    }

    await logUserActivity(req, "DELETE_TICKET", `Deleted ticket: ${ticketId}`, "success");

    res.status(200).json({
      isSuccess: true,
      message: "Ticket deleted successfully",
      data: { ticketId }
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    await logUserActivity(req, "DELETE_TICKET", `Failed to delete ticket: ${req.params.ticketId}`, "error");
    res.status(500).json({
      isSuccess: false,
      message: "Failed to delete ticket",
      error: error.message
    });
  }
};

/**
 * GET USER TICKET STATISTICS
 * Returns counts of tickets by status for user's organization
 */
const getTicketStats = async (req, res) => {
  try {
    const organizationId = req.user?.organization_id;

    if (!organizationId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Organization ID is required",
      });
    }

    const stats = await UserTicket.aggregate([
      { $match: { organizationId } },
      {
        $group: {
          _id: null,
          open: { $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "In-Progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        }
      }
    ]);

    const result = stats[0] || { open: 0, inProgress: 0, resolved: 0 };

    return res.status(200).json({
      isSuccess: true,
      message: "User ticket statistics fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch user ticket statistics",
    });
  }
};

//---------------------------------------------
// GET USER TICKET DETAILS
//---------------------------------------------
const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user._id;

    if (!ticketId) {
      return res.status(400).json({
        isSuccess: false,
        message: "ticketId is required",
      });
    }

    const ticket = await UserTicket.findOne({
      ticketId,
      organizationId,
      createdBy: userId
    });

    if (!ticket) {
      await logUserActivity(req, "view", `Ticket not found: ${ticketId}`, "failed");
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found",
      });
    }

    await logUserActivity(req, "view", `Viewed ticket details: ${ticketId}`);

    return res.status(200).json({
      isSuccess: true,
      message: "Ticket details fetched successfully",
      data: ticket,
    });

  } catch (error) {
    await logUserActivity(req, "view", error.message, "failed");
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch ticket details",
      error: error.message,
    });
  }
};

//---------------------------------------------
// ADD COMMENT TO A USER TICKET
//---------------------------------------------
const addTicketComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizationId = req.user.organization_id;
    const userId = req.user._id;

    if (!ticketId) {
      return res.status(400).json({
        isSuccess: false,
        message: "ticketId is required",
      });
    }

    const { message = "", attachments = [] } = req.body;

    if (!message && attachments.length === 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "Message or attachments required",
      });
    }

    // Determine sender type - users are always "User"
    const sender = "User";

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      sender,
      senderId: userId,
      senderName: req.user.name || req.user.email || "Unknown",
      message,
      attachments,
      createdAt: new Date(),
    };

    const updatedTicket = await UserTicket.findOneAndUpdate(
      { ticketId, organizationId, createdBy: userId },
      {
        $push: { conversation: newComment },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!updatedTicket) {
      await logUserActivity(req, "comment", `Ticket not found: ${ticketId}`, "failed");
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found",
      });
    }

    await logUserActivity(req, "comment", `Added comment to ticket ${ticketId}`);

    return res.status(201).json({
      isSuccess: true,
      message: "Comment added successfully",
      data: updatedTicket, // Return the full updated ticket
    });

  } catch (error) {
    await logUserActivity(req, "comment", error.message, "failed");
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

module.exports = {
  getTickets,
  createTicket,
  updateTicketStatus,
  updateTicket,
  deleteTicket,
  getTicketStats,
  getTicketDetails,
  addTicketComment
};