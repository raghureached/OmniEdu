const AdminTicket = require("../../models/adminTicket");
const mongoose = require("mongoose");
const { logActivity } = require("../../utils/activityLogger");
/**
 * CREATE ADMIN TICKET
 * Only admins inside the same organization can raise tickets.
 */
const createAdminTicket = async (req, res) => {
  try {
    const organizationId = req.user?.organization_id;
    const createdBy = req.user?._id;

    if (!organizationId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Organization ID is required",
      });
    }

    const { subject, description, errorMessage = "", attachments = [] } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        isSuccess: false,
        message: "Subject and description are required",
      });
    }

    const ticket = await AdminTicket.create({
      subject,
      description,
      errorMessage,
      attachments,
      organizationId,
      createdBy,
    });

   

    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Created support ticket: ${subject || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(201).json({
      isSuccess: true,
      message: "Support ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Failed to create support ticket`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

    return res.status(500).json({
      isSuccess: false,
      message: "Failed to create ticket",
      error: error.message,
    });
  }
};



/**
 * GET ALL TICKETS (BY ORGANIZATION)
 */
const getAdminTickets = async (req, res) => {
  try {
    const organizationId = req.user?.organization_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!organizationId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Organization ID is required",
      });
    }

    const tickets = await AdminTicket.find({ organizationId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });


    return res.status(200).json({
      isSuccess: true,
      message: "Tickets fetched successfully",
      data: tickets,
      page,
      limit,
      total: await AdminTicket.countDocuments({ organizationId }),
    });
  } catch (error) {

    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch tickets",
      error: error.message,
    });
  }
};



/**
 * UPDATE TICKET STATUS
 * Allowed statuses: Open, In-Progress, Resolved
 */
const updateAdminTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const validStatuses = ["Open", "In-Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid status",
      });
    }

    const organizationId = req.user?.organization_id;

    const ticket = await AdminTicket.findOneAndUpdate(
      { ticketId, organizationId },
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found",
      });
    }

  

    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Updated ticket status: ${ticketId || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      isSuccess: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Failed to update ticket status`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update ticket status",
      error: error.message,
    });
  }
};



/**
 * DELETE SUPPORT TICKET
 */
const deleteAdminTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizationId = req.user?.organization_id;

    const ticket = await AdminTicket.findOneAndDelete({
      ticketId,
      organizationId,
    });

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found",
      });
    }

   
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Deleted ticket: ${ticket?.subject || ticketId || 'unknown'}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      isSuccess: true,
      message: "Ticket deleted successfully",
      data: ticket,
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to delete ticket`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

    return res.status(500).json({
      isSuccess: false,
      message: "Failed to delete ticket",
      error: error.message,
    });
  }
};
/**
 * UPDATE TICKET DETAILS (subject, description, errorMessage, attachments)
 */
const updateAdminTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizationId = req.user?.organization_id;

    const { subject, description, errorMessage = "", attachments } = req.body;

    const update = {};
    if (typeof subject === 'string') update.subject = subject;
    if (typeof description === 'string') update.description = description;
    if (typeof errorMessage === 'string') update.errorMessage = errorMessage;
    if (attachments && Array.isArray(attachments)) update.attachments = attachments;

    const ticket = await AdminTicket.findOneAndUpdate(
      { ticketId, organizationId },
      update,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ isSuccess: false, message: "Ticket not found" });
    }

    return res.status(200).json({
      isSuccess: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to update ticket",
      error: error.message,
    });
  }
};

/**
 * GET ADMIN TICKET STATISTICS
 * Returns counts of tickets by status for the admin's organization
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

    const stats = await AdminTicket.aggregate([
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
      message: "Ticket statistics fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch ticket statistics",
    });
  }
};

//---------------------------------------------
// GET TICKET DETAILS
//---------------------------------------------
const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizationId = req.user.organization_id;

    if (!ticketId) {
      return res.status(400).json({
        isSuccess: false,
        message: "ticketId is required",
      });
    }

    // Find ticket within the organization
    const ticket = await AdminTicket.findOne({
      ticketId,
      organizationId,
    }).lean();

    if (!ticket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found",
      });
    }

    ticket.conversation = ticket.conversation || [];


    return res.status(200).json({
      isSuccess: true,
      message: "Ticket details fetched successfully",
      data: ticket,
    });

  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch ticket details",
      error: error.message,
    });
  }
};

//---------------------------------------------
// ADD COMMENT TO A TICKET
//---------------------------------------------
const addTicketComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const organizationId = req.user.organization_id;

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

    // Determine sender type
    const sender = req.user.role === "GlobalAdmin" ? "GlobalAdmin" : "Admin";

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      sender,
      senderId: req.user._id,
      senderName: req.user.name || req.user.email || "Unknown",
      message,
      attachments,
      createdAt: new Date(),
    };

    const updatedTicket = await AdminTicket.findOneAndUpdate(
      { ticketId, organizationId },
      {
        $push: { conversation: newComment },
        $set: { updatedAt: new Date() },
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({
        isSuccess: false,
        message: "Ticket not found",
      });
    }

    return res.status(201).json({
      isSuccess: true,
      message: "Comment added successfully",
      data: updatedTicket, // Return the full updated ticket
    });

  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

module.exports = {
  createAdminTicket,
  getAdminTickets,
  updateAdminTicketStatus,
  deleteAdminTicket,
  updateAdminTicket,
  getTicketStats,
  getTicketDetails,
  addTicketComment
};
