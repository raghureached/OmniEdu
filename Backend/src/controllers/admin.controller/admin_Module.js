const ForUserAssignment = require("../../models/Admin/forUserAssigments_model");
const LearningPath = require("../../models/Admin/LearningPaths/learningPath_model");
const OrganizationModule = require("../../models/Admin/Module/moduleOrganization_model");
const UserContentProgress = require("../../models/User/userContentProgress_model");


const addModule = async (req, res) => {
  try {
    const primaryFile = req.uploadedFiles?.primaryFile?.[0]?.url;
    const additionalFile = req.uploadedFiles?.additionalFile?.[0]?.url;
    const thumbnail = req.uploadedFiles?.thumbnail?.[0]?.url;
    const { title,trainingType,team,subteam,category,submissionEnabled,feedbackEnabled,instructions, badges,stars,credits,description,externalResource, pushable_to_orgs, tags, duration,learningOutcomes,prerequisites,richText } = req.body;
    const created_by = req.user?._id || null;
    const newModule = new OrganizationModule({
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
      learning_outcomes:learningOutcomes,
      prerequisites:prerequisites.split(","),
      instructions,
      tags,
      duration,
      created_by,
      richText,
      org_id:req.user.organization_id
    });

    await newModule.save();
    return res.status(201).json({
      success: true,
      message: 'Module added successfully.',
      data: newModule
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add module.',
      error: error.message
    });
  }
};

const getModule = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const org_id = req.user.organization_id;
    const content = await OrganizationModule.find({org_id:org_id}).populate("team").skip(skip).limit(limit)
    const total = await OrganizationModule.countDocuments()

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

const getModuleById = async (req, res) => {
  try {
    const content = await OrganizationModule.findOne({ uuid: req.params.id }).populate("created_by");
    // console.log(content)
    return res.status(200).json({ success: true, message: 'Module fetched successfully.', data: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch module.', error: error.message });
  } 
}
const bulkDelete = async(req,res) => {
  try {
    const deletedModules = await OrganizationModule.deleteMany({ uuid: { $in: req.body } })
    return res.status(200).json({ success: true, message: 'Content deleted successfully.', data: deletedModules })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete content.', error: error.message })
  }
}
const editModule = async (req, res) => {
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
    const updatedModule = await OrganizationModule.findOneAndUpdate(
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

    

    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    console.error("❌ Edit Content Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update content",
      error: error.message,
    });
  }
};


const deleteModule = async (req, res) => {
  try {
    // First, find the OrganizationModule by uuid
    const moduleDoc = await OrganizationModule.findOne({ uuid: req.params.id });

    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    // Block delete if this module is present in any LearningPath lessons by id or uuid
    const referencedLP = await LearningPath.findOne({
      $or: [
        { "lessons.id": moduleDoc._id },
        { "lessons.uuid": req.params.id },
      ],
    }).select("_id title uuid");

    if (referencedLP) {
      return res.status(400).json({
        success: false,
        message: "This module is part of a Learning Path. Please remove it from the Learning Path first.",
        learningPath: { id: referencedLP._id, title: referencedLP.title, uuid: referencedLP.uuid },
      });
    }

    // Safe to delete now
    const deletedModule = await OrganizationModule.findOneAndDelete({ uuid: req.params.id });

    // Find assignments that reference this module by ObjectId
    const relatedAssignments = await ForUserAssignment.find({
      assign_type: "OrganizationModule",
      contentId: deletedModule._id,
    }).select("_id");

    const assignmentIds = relatedAssignments.map((a) => a._id);

    if (assignmentIds.length > 0) {
      // Delete those assignments
      await ForUserAssignment.deleteMany({ _id: { $in: assignmentIds } });
      // Delete user progress entries linked to those assignments
      await UserContentProgress.deleteMany({ assignment_id: { $in: assignmentIds } });
    }

    return res.status(200).json({
      success: true,
      message: "Content and related data deleted successfully",
      data: deletedModule,
      meta: { deletedAssignments: assignmentIds.length },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message,
    });
  }
}


const getModules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const content = await OrganizationModule.find({org_id:req.user.organization_id}).skip(skip).limit(limit)
    const total = await OrganizationModule.countDocuments()
    // console.log(content)
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

module.exports = {
  addModule,
  getModule,
  editModule,
  deleteModule,
  getModuleById,
  bulkDelete,
  getModules
}