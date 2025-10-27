const ForUserAssignment = require("../../models/forUserAssigments_model");
const Team = require("../../models/teams_model");
// If you also track user progress
// const Progress = require("../models/progress.model");

const createAssignment = async (req, res) => {
  try {
    const {
      assignDate,
      dueDate,
      assign_type,
      notifyUsers,
      isRecurring,
      assignedUsers,
      contentId,
      contentName,
      contentType,
      assignTime,
      dueTime,
      groups
    } = req.body;

    if (!contentId ) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing required fields",
      });
    }
    const content_type = contentType === "Module" ? "OrganizationModule" : contentType === "Assessment" ? "OrganizationAssessments" : contentType === "Survey" ? "OrganizationSurvey" : contentType === "LearningPath" ? "LearningPath" : null;
    let assignment;
    if(assign_type === "individual"){
     assignment = await ForUserAssignment.create({
        organization_id:req.user.organization_id,
        assign_type:content_type,
        assign_on: assignDate || Date.now(),
        due_date:dueDate,
        recursive: isRecurring ?? false,
        assigned_users:assignedUsers,
        created_by: req.user._id,
        dueTime:dueTime,
        assignTime:assignTime,
        contentId:contentId,
        contentType:contentType,
        contentName:contentName
      });
    }else{
      
     assignment = await ForUserAssignment.create({
      organization_id:req.user.organization_id,
      assign_type:content_type,
      assign_on: assignDate || Date.now(),
      due_date:dueDate,
      recursive: isRecurring ?? false,
      assigned_users:null,
      created_by: req.user._id,
      dueTime:dueTime,
      assignTime:assignTime,
      contentId:contentId,
      contentType:contentType,
      contentName:contentName,
      groups:groups
    });
  }
    return res.status(201).json({
      isSuccess: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

const editAssignment = async(req,res)=>{
    try {
        const {id} = req.params
        const {assign_type, assign_id, assign_on, due_date, notify_users, recursive, assigned_users} = req.body
        const assignment = await ForUserAssignment.findOneAndUpdate({uuid:id},{
            organization_id:req.user.organization_id,
            assign_type,
            assign_id,
            assign_on,
            due_date,
            notify_users,
            recursive,
            assigned_users
        })
        return res.status(200).json({
            isSuccess:true,
            message:"Assignment edited successfully",
            data:assignment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to edit assignment",
            error:error.message
        })
    }
} 

const deleteAssignment = async(req,res)=>{
    try {
        const {id} = req.params
        const assignment = await ForUserAssignment.findOneAndDelete({uuid:id})
        return res.status(200).json({
            isSuccess:true,
            message:"Assignment deleted successfully",
            data:assignment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to delete assignment",
            error:error.message
        })
    }
}

const getAssignments = async(req,res)=>{
    try {
        const assignments = await ForUserAssignment.find()
        return res.status(200).json({
            isSuccess:true,
            message:"Assignments fetched successfully",
            data:assignments
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch assignments",
            error:error.message
        })
    }
}

const getAssignment = async(req,res)=>{
    try {
        const {id} = req.params
        const assignment = await ForUserAssignment.findOne({uuid:id}).populate("assign_id")
        return res.status(200).json({
            isSuccess:true,
            message:"Assignment fetched successfully",
            data:assignment.assign_id
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch assignment",
            error:error.message
        })
    }
}
module.exports = {
  createAssignment,
  editAssignment,
  deleteAssignment,
  getAssignments,
  getAssignment
};
