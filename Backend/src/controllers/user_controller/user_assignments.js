const ForUserAssignment = require("../../models/forUserAssigments_model");

const getUserAssignments = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        isSuccess: false,
        message: "Unauthorized: user not found",
      });
    }

    // Filters from query params (optional)
    const { status, type } = req.query;

    const query = { assigned_users: { $in: [req.user._id] } };
    if (status) query.status = status; // if you track status
    if (type) query.assign_type = type; // filter by type (module, survey...)

    const assignments = await ForUserAssignment.find(query)
      .populate("organization_id", "name logo_url") // show org info
      .populate("created_by", "name email") // who created
      .lean();

    return res.status(200).json({
      isSuccess: true,
      message: "Assignments fetched successfully",
      count: assignments.length,
      data: assignments,
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