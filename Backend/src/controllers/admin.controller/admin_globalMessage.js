const ForAdminMessage = require("../../models/messageforAdmin");
const Organization = require("../../models/globalAdmin/Organization/organization_model");
const mongoose = require("mongoose");

// Fetch Global Admin -> Admin messages for the current admin's organization
// Uses req.user to infer organization id set by admin auth middleware
const getGlobalAdminMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Try multiple shapes for organization identifier
    const orgIdFromUser =
      req.user?.organization_id ||
      req.user?.organization?.uuid ||
      req.user?.organizationUuid ||
      req.user?.orgId ||
      req.user?.org_id ||
      req.user?.orgUuid ||
      req.user?.organizationUUID ||
      req.user?.organizationId ||
      req.user?.organization?.id;

    const candidate = orgIdFromUser || req.query.orgId || req.body?.orgId;

    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: "Organization id not provided or not found on user",
      });
    }

    // Resolve to organization UUID (messages are stored with organization uuid)
    let orgDoc = null;
    // Try by uuid first
    const orgByUuid = await Organization.findById(req.user.organization_id).select("_id uuid");
    if (orgByUuid) {
      orgDoc = orgByUuid;
    } else if (mongoose.isValidObjectId(candidate)) {
      const orgById = await Organization.findById(candidate).select("_id uuid");
      if (orgById) orgDoc = orgById;
    }

    if (!orgDoc) {
      return res.status(404).json({
        success: false,
        message: "Organization not found for provided id",
      });
    }

    const query = { organization_id: req.user.organization_id, status: "active" };

    const messages = await ForAdminMessage.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await ForAdminMessage.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

module.exports = { getGlobalAdminMessages };
