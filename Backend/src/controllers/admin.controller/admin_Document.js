const OrganizationDocument = require("../../models/Admin/Document/documentOrganization_model");


const addDocument = async (req, res) => {
  try {
    const primaryFile = req.uploadedFiles?.primaryFile?.[0]?.url;
    const additionalFile = req.uploadedFiles?.additionalFile?.[0]?.url;
    const thumbnail = req.uploadedFiles?.thumbnail?.[0]?.url;
    const { title,trainingType,team,subteam,category,submissionEnabled,feedbackEnabled,instructions, badges,stars,credits,description,externalResource, pushable_to_orgs, tags, duration,learningOutcomes,prerequisites,richText } = req.body;
    const created_by = req.user?._id || null;
    const newDocument = new OrganizationDocument({
      title,
      description,
      trainingType,
      team,
      subteam,
      category,
      // submissionEnabled,
      // feedbackEnabled,
      badges,
      stars,
      credits,
      // externalResource,
      primaryFile,
      // additionalFile,
      thumbnail,
      pushable_to_orgs,
      // learning_outcomes:learningOutcomes,
      // prerequisites:prerequisites.split(","),
      instructions,
      // tags,
      duration,
      created_by,
      richText,
      org_id:req.user.organization_id
    });

    await newDocument.save();
    return res.status(201).json({
      success: true,
      message: 'Document added successfully.',
      data: newDocument
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Failed to add Document.',
      error: error.message
    });
  }
};

const getDocument = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const org_id = req.user.organization_id;
    const content = await OrganizationDocument.find({org_id:org_id}).populate("team").skip(skip).limit(limit)
    const total = await OrganizationDocument.countDocuments()

    return res.status(200).json({
      success: true,
      message: 'Documents fetched successfully.',
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
      message: 'Failed to fetch Documents.',
      error: error.message
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const content = await OrganizationDocument.findOne({ uuid: req.params.id }).populate("created_by");
    // console.log(content)
    return res.status(200).json({ success: true, message: 'Document fetched successfully.', data: content });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch Document.', error: error.message });
  } 
}
const documentbulkDelete = async(req,res) => {
  try {
    const deletedDocuments = await OrganizationDocument.deleteMany({ uuid: { $in: req.body } })
    return res.status(200).json({ success: true, message: 'Content deleted successfully.', data: deletedDocuments })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete content.', error: error.message })
  }
}
const editDocument = async (req, res) => {
  try {
    const {
      title,
      trainingType,
      team,
      subteam,
      category,
      // submissionEnabled,
      // feedbackEnabled,
      instructions,
      badges,
      stars,
      credits,
      description,
      // enableFeedback,
      // externalResource,
      pushable_to_orgs,
      // tags,
      duration,
      // learningOutcomes,
      // prerequisites
    } = req.body;
    const uploadedFiles = req.uploadedFiles || {};
    const primaryFileUrl = uploadedFiles.primaryFile?.[0]?.url || null;
    // const additionalFileUrl = uploadedFiles.additionalFile?.[0]?.url || null;
    const thumbnailUrl = uploadedFiles.thumbnail?.[0]?.url || null;

    const updateData = {
      title,
      trainingType,
      team,
      subteam,
      category,
      // submissionEnabled,
      // feedbackEnabled,
      instructions,
      badges,
      stars,
      credits,
      description,
      // enableFeedback,
      // externalResource,
      pushable_to_orgs,
      // tags,
      duration,
      // learningOutcomes,
      // prerequisites,
    };

    if (primaryFileUrl) updateData.primaryFile = primaryFileUrl;
    // if (additionalFileUrl) updateData.additionalFile = additionalFileUrl;
    if (thumbnailUrl) updateData.thumbnail = thumbnailUrl;
    const updatedDocument = await OrganizationDocument.findOneAndUpdate(
      { uuid: req.params.id },
      updateData,
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    

    return res.status(200).json({
      success: true,
      message: "Content updated successfully",
      data: updatedDocument,
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


const deleteDocument = async (req, res) => {
  try {
    const deletedDocument = await OrganizationDocument.findOneAndDelete({ uuid: req.params.id })
    if (!deletedDocument) {
      return res.status(404).json({
        success: false,
        message: "Content not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Content deleted successfully",
      data: deletedDocument
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete content",
      error: error.message
    })
  }
}


const getDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;
    const content = await OrganizationDocument.find({org_id:req.user.organization_id}).skip(skip).limit(limit)
    const total = await OrganizationDocument.countDocuments()
    // console.log(content)
    return res.status(200).json({
      success: true,
      message: 'Documents fetched successfully.',
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
      message: 'Failed to fetch Documents.',
      error: error.message
    });
  }
};

module.exports = {
  addDocument,
  getDocument,
  editDocument,
  deleteDocument,
  getDocumentById,
  documentbulkDelete,
  getDocuments
}