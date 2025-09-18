const Assessment = require("../../models/assessment_model");
const Content = require("../../models/content_model");
const LearningPath = require("../../models/learningPath_model");
const Module = require("../../models/moduleOrganization_model");
const logAdminActivity = require("./admin_activity");
const addLearningPath = async (req, res) => {
    try {
        const { title, description, schedule, status, organization_id } = req.body;
        const learningPath = new LearningPath({
            title,
            description,
            schedule,
            status,
            organization_id,
            //Change when authentication is added
            created_by: req.user?._id
        });
        await learningPath.save();
        await logAdminActivity(req, "add", `Learning path added successfully: ${learningPath.title}`);
        return res.status(201).json({
            isSuccess: true,
            message: 'Learning path added successfully.',
            data: learningPath
        });
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: 'Failed to add learning path.',
            error: error.message
        });
    }
}
////Need changes//////
const getLearningPaths = async (req, res) => {
    try {
        // const orgId = req.user.orgId || "68bc0898fdb4a64d5a727a60";
        const learningPath = await LearningPath.find({organization_id: "68bc0898fdb4a64d5a727a60"}).lean();
        await logAdminActivity(req, "view", `Learning paths fetched successfully: ${learningPath.length}`);
        return res.status(200).json({
            isSuccess: true,
            message: 'Learning paths fetched successfully.',
            data: learningPath
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: 'Failed to fetch learning paths.',
            error: error.message
        })
    }
}

const getContentsOfLearningPath = async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({ uuid: req.params.id })
      .populate({
        path: "schedule",
        populate: [
          { path: "modules" },
          { path: "assessments" }
        ]
      });

    if (!learningPath) {
      await logAdminActivity(req, "view", `Learning path not found: ${req.params.id}`);
      return res.status(404).json({
        isSuccess: false,
        message: "Learning path not found",
      });
    }
    await logAdminActivity(req, "view", `Learning path fetched successfully: ${learningPath.title}`);
    return res.status(200).json({
      isSuccess: true,
      message: "Learning path fetched successfully",
      data: learningPath,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch learning path contents",
      error: error.message,
    });
  }
};

const editLearningPath = async (req, res) => {
    try {
        const { title, description, schedule, status, organization_id } = req.body;
        const learningPath = await LearningPath.findOneAndUpdate({ uuid: req.params.id }, { title, description, schedule, status, organization_id }, { new: true });
        if(!learningPath){
          await logAdminActivity(req, "edit", `Learning path not found: ${req.params.id}`);
          return res.status(404).json({
            isSuccess:false,
            message:"Learning path not found"
          })
        }
        await logAdminActivity(req, "edit", `Learning path updated successfully: ${learningPath.title}`);
        return res.status(200).json({
            isSuccess: true,
            message: 'Learning path updated successfully.',
            data: learningPath
        });
    } catch (error) {
        return res.status(500).json({
            isSuccess: false,
            message: 'Failed to update learning path.',
            error: error.message
        });
    }
}

const deleteLearningPath = async(req,res)=>{
  const deletedLearningPath = await LearningPath.findOneAndDelete({uuid:req.params.id}) 
  if(!deletedLearningPath){
    await logAdminActivity(req, "delete", `Learning path not found: ${req.params.id}`);
    return res.status(404).json({
      isSuccess:false,
      message:"Learning path not found"
    })
  }
  await logAdminActivity(req, "delete", `Learning path deleted successfully: ${deletedLearningPath.title}`);
  return res.status(200).json({
    isSuccess:true,
    message:"Learning path deleted successfully",
    data:deletedLearningPath
  })
}
module.exports = {
    addLearningPath,
    getLearningPaths,
    getContentsOfLearningPath,
    editLearningPath,
    deleteLearningPath
}