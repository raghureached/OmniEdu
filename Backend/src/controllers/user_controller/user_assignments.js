const ForUserAssignment = require("../../models/forUserAssigments_model");
const UserContentProgress = require("../../models/userContentProgress_model");

const getUserAssignments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        isSuccess: false,
        message: "Unauthorized: user not found",
      });
    }

    // Filters from query params (optional)
    const enrolled = await UserContentProgress.find({ user_id: req.user._id })
  .populate({
    path: "assignment_id",
    select: "uuid name title description assign_type contentId assign_on due_date created_by",
    populate: [
      {
        path: "contentId", // this is resolved using refPath: assign_type
        select:
          "title description duration tags team subteam category status thumbnail credits stars badges uuid",
      },
      { path: "created_by", select: "name email" },
    ],
  })
  .lean();
    

    return res.status(200).json({
      isSuccess: true,
      message: "Assignments fetched successfully",
      count: enrolled.length,
      data: enrolled,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

const getAssignment = async(req,res)=>{
    try {
        const {id} = req.params
        const assignment = await ForUserAssignment.findOne({uuid:id}).populate("content_id")
        return res.status(200).json({
            isSuccess:true,
            message:"Assignment fetched successfully",
            data:assignment
        })
    } catch (error) {
        return res.status(500).json({
            isSuccess:false,
            message:"Failed to fetch assignment",
            error:error.message
        })
    }
}

module.exports={
    getUserAssignments,
    getAssignment
}