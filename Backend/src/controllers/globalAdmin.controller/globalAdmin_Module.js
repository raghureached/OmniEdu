const { default: mongoose } = require("mongoose");
const GlobalModule = require("../../models/globalModule_model");
const { logActivity } = require("../../utils/activityLogger");

const addContent = async (req, res) => {
  try {
    const primaryFile = req.uploadedFiles?.primaryFile?.[0]?.url;
    const additionalFile = req.uploadedFiles?.additionalFile?.[0]?.url;
    const thumbnail = req.uploadedFiles?.thumbnail?.[0]?.url;
    const { title, trainingType, team, subteam, category, submissionEnabled, feedbackEnabled, instructions, badges, stars, credits, description, externalResource, pushable_to_orgs, tags, duration, learningOutcomes, prerequisites, richText } = req.body;
    const created_by = req.user?._id || null;
    const newModule = new GlobalModule({
      title,
      description,
      trainingType,
      team,
      subteam,
      category,
      submissionEnabled,
      feedbackEnabled,
      badges,
      stars,
      credits,
      externalResource,
      primaryFile,
      additionalFile,
      thumbnail,
      pushable_to_orgs,
      status:"Saved",
      learning_outcomes: learningOutcomes,
      prerequisites: prerequisites.split(","),
      instructions,
      tags,
      duration,
      created_by,
      richText
    });

    await newModule.save();
    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Created global content: ${newModule.title}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    })
    return res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      data: newModule
    });
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Create",
      details: `Failed to create global content`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to add module.',
      error: error.message
    });
  }
};

const getContent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const content = await GlobalModule.find().skip(skip).limit(limit)
    const total = await GlobalModule.countDocuments()
    // await logGlobalAdminActivity(req,"Get Content","content", `Content fetched successfully ${content.title}`)
    return res.status(200).json({
      success: true,
      message: 'Modules fetched successfully.',
      data: content,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch modules.',
      error: error.message
    });
  }
};

const getContentById = async (req, res) => {
  try {
    const content = await GlobalModule.findOne({ uuid: req.params.id }).populate("team").populate("created_by");
    // await logGlobalAdminActivity(req,"Get Content","content",`Module fetched successfully ${content.title}`)
    return res.status(200).json({ success: true, message: 'Module fetched successfully.', data: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch module.', error: error.message });
  }
}
const bulkDelete = async (req, res) => {
  try {
    const deletedModules = await GlobalModule.deleteMany({ uuid: { $in: req.body } })
    console.log(req.body)
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Bulk deleted global content: ${deletedModules.deletedCount} items`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    })
    return res.status(200).json({ success: true, message: 'Content deleted successfully.', data: deletedModules })
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to bulk delete global content`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });
    return res.status(500).json({ success: false, message: 'Failed to delete content.', error: error.message })
  }
}
const editContent = async (req, res) => {
  try {
    const {
      title,
      trainingType,
      team,
      subteam,
      category,
      submissionEnabled,
      feedbackEnabled,
      instructions,
      badges,
      stars,
      credits,
      description,
      enableFeedback,
      externalResource,
      pushable_to_orgs,
      tags,
      duration,
      learningOutcomes,
      prerequisites
    } = req.body;
    const uploadedFiles = req.uploadedFiles || {};
    const primaryFileUrl = uploadedFiles.primaryFile?.[0]?.url || null;
    const additionalFileUrl = uploadedFiles.additionalFile?.[0]?.url || null;
    const thumbnailUrl = uploadedFiles.thumbnail?.[0]?.url || null;

    const updateData = {
      title,
      trainingType,
      team,
      subteam,
      category,
      submissionEnabled,
      feedbackEnabled,
      instructions,
      badges,
      stars,
      credits,
      description,
      enableFeedback,
      externalResource,
      pushable_to_orgs,
      tags,
      duration,
      learningOutcomes,
      prerequisites,
    };

    if (primaryFileUrl) updateData.primaryFile = primaryFileUrl;
    if (additionalFileUrl) updateData.additionalFile = additionalFileUrl;
    if (thumbnailUrl) updateData.thumbnail = thumbnailUrl;

    const updatedModule = await GlobalModule.findOneAndUpdate(
      { uuid: req.params.id },
      updateData,
      { new: true }
    );

    if (!updatedModule) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Updated global content: ${updatedModule.title}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    })

    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    console.error("❌ Edit Content Error:", error);
    await logActivity({
      userId: req.user._id,
      action: "Update",
      details: `Failed to update global content: ${req.body?.title || req.params.id}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    })
    return res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error.message,
    });
  }
};


const deleteContent = async (req, res) => {
  try {
    const deletedModule = await GlobalModule.findOneAndDelete({ uuid: req.params.id })
    if (!deletedModule) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      })
    }
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Deleted global content: ${deletedModule.title}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    })
    return res.status(200).json({
      success: true,
      message: "Content deleted successfully",
      data: deletedModule
    })
  } catch (error) {
    await logActivity({
      userId: req.user._id,
      action: "Delete",
      details: `Failed to delete global content: ${req.params.id}`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    })
    return res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message
    })
  }
}

const addDraft = async (req, res) => {
  try {
    const created_by = req.user?._id;
    if (!created_by) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      title,
      description,
      trainingType,
      team,
      subteam,
      category,
      submissionEnabled,
      feedbackEnabled,
      instructions,
      badges,
      stars,
      credits,
      externalResource,
      pushable_to_orgs,
      tags,
      duration,
      learningOutcomes,
      prerequisites,
      richText,
    } = req.body;

    // 🔐 Prevent duplicate drafts per user + title
    const existingDraft = await GlobalModule.findOne({
      created_by,
      status: "Draft",
      title,
    });

    if (existingDraft) {
      return res.status(200).json({
        success: true,
        message: "Draft already exists",
        data: existingDraft,
      });
    }

    const payload = {
      title,
      description,
      trainingType,
      team,
      subteam,
      category,
      submissionEnabled,
      feedbackEnabled,
      instructions,
      badges,
      stars,
      credits,
      externalResource,
      pushable_to_orgs,
      tags,
      duration,
      richText,
      status: "Draft",
      created_by,
      learning_outcomes: learningOutcomes || [],
      prerequisites: Array.isArray(prerequisites)
        ? prerequisites
        : prerequisites?.split(",").map((p) => p.trim()),
    };

    const draft = await GlobalModule.create(payload);

    return res.status(201).json({
      success: true,
      message: "Draft created",
      data: draft,
    });
  } catch (error) {
    console.error("addDraft error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create draft",
      error: error.message,
    });
  }
};


// In your updateDraft controller
const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Normalize fields
    if (updates.learningOutcomes) {
      updates.learning_outcomes = updates.learningOutcomes;
      delete updates.learningOutcomes;
    }

    if (updates.prerequisites && !Array.isArray(updates.prerequisites)) {
      updates.prerequisites = updates.prerequisites
        .split(",")
        .map((p) => p.trim());
    }

    // Remove empty fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] === "" || updates[key] === undefined) {
        delete updates[key];
      }
    });

    updates.lastUpdated = new Date();

    const updatedDraft = await GlobalModule.findOneAndUpdate(
      { uuid: id, status: "Draft" },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedDraft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found or not editable",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      data: updatedDraft,
    });
  } catch (error) {
    console.error("updateDraft error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update draft",
      error: error.message,
    });
  }
};


const deleteDraft = async (req, res) => {
  try {
    const draft = await GlobalModule.findOneAndDelete({ 
      uuid: req.params.id,
      status: "Draft" // Only delete if it's a draft
    });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found or already deleted'
      });
    }

    // Log the deletion activity
    await logActivity({
      userId: req.user._id,
      action: "Delete Draft",
      details: `Draft "${draft.title}" (${draft.uuid}) was deleted`,
      userRole: req.user.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "success",
    });

    return res.status(200).json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    await logActivity({
      userId: req.user?._id,
      action: "Delete Draft",
      details: `Failed to delete draft: ${error.message}`,
      userRole: req.user?.role,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      status: "failed",
    });

    return res.status(500).json({
      success: false,
      message: 'Failed to delete draft',
      error: error.message
    });
  }
};

const getDrafts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = -1 } = req.query;
    
    const query = {
      status: "Draft",
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      })
    };

    const sort = { [sortBy]: Number(sortOrder) };
    
    const drafts = await GlobalModule.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-__v'); // Exclude version key

    const total = await GlobalModule.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: drafts,
      pagination: {
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch drafts',
      error: error.message
    });
  }
};

const getDraftById = async (req, res) => {
  try {
    const draft = await GlobalModule.findOne({ 
      uuid: req.params.id,
      status: "Draft" 
    }).select('-__v');

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: draft
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch draft',
      error: error.message
    });
  }
};

module.exports = {
  addContent,
  getContent,
  editContent,
  deleteContent,
  getContentById,
  bulkDelete,
  updateDraft,
  addDraft,
  deleteDraft,
  getDrafts,
  getDraftById
}