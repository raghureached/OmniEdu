const ForUserAssignment = require("../../models/forUserAssigments_model");
// If you also track user progress
// const Progress = require("../models/progress.model");

const createAssignment = async (req, res) => {
  try {
    const {
      organization_id,
      assign_type,
      assign_id,
      name,
      assign_on,
      due_date,
      notify_users,
      recursive,
      assigned_users
    } = req.body;

    // ✅ Validation
    if (!organization_id || !assign_type || !assign_id || !name || !due_date) {
      return res.status(400).json({
        isSuccess: false,
        message: "Missing required fields",
      });
    }

    // ✅ Create assignment
    const assignment = await ForUserAssignment.create({
      organization_id,
      assign_type,
      assign_id,
      name,
      assign_on: assign_on || Date.now(), // default: now
      due_date,
      notify_users: notify_users ?? true, // default true
      recursive: recursive ?? false, // default false
      assigned_users,
      created_by: req.user._id,
    });

    // ✅ (Optional) Track progress for assigned users
    if (assigned_users && assigned_users.length > 0) {
      // Uncomment if you have Progress model
      // const progressDocs = assigned_users.map((userId) => ({
      //   user_id: userId,
      //   assignment_id: assignment._id,
      //   assign_type,
      //   assign_ref: assign_id,
      //   status: "assigned",
      // }));
      // await Progress.insertMany(progressDocs);
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
        const {organization_id, assign_type, assign_id, name, assign_on, due_date, notify_users, recursive, assigned_users} = req.body
        const assignment = await ForUserAssignment.findOneAndUpdate({uuid:id},{
            organization_id,
            assign_type,
            assign_id,
            name,
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
