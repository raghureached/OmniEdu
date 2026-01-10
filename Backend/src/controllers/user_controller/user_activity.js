const UserContentProgress = require("../../models/User/userContentProgress_model")

const getUserActivity = async(req,res)=>{
  try {
    const userProgress = await UserContentProgress.find({user_id:req.user._id}).populate([
        {
          path: "assignment_id",
          select: "uuid name title description assign_type contentId assign_on due_date created_by",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
            { path: "created_by", select: "name email" },
          ],
        },
        {
          path: "enrollment_id",
          select: "uuid name assign_type contentId assign_on",
          populate: [
            {
              path: "contentId",
              select:
                "title description duration tags team subteam category status thumbnail credits stars badges uuid",
            },
          ],
        },
      ])
      .lean();
    const activity = [];
    userProgress.forEach((progress)=>{
      let curr = {};
      curr._id = progress._id;
      curr.type = progress.contentType;
      // Use title instead of name since that's what we're selecting
      curr.name = progress.assignment_id?.contentId?.title || progress.enrollment_id?.contentId?.title || progress.assignment_id?.title || progress.enrollment_id?.title || 'Unknown Activity';
      curr.assignedOn = progress.createdAt;
      curr.startedOn = progress.started_at;
      curr.completedOn = progress.completed_at;
      curr.status = progress.status;
      curr.progress = progress.progress_pct;
      curr.stars = progress.assignment_id?.contentId?.stars || progress.enrollment_id?.contentId?.stars || 0;
      curr.badges = progress.assignment_id?.contentId?.badges || progress.enrollment_id?.contentId?.badges || [];
      // Fixed: use credits instead of badges in fallback
      curr.credits = progress.assignment_id?.contentId?.credits || progress.enrollment_id?.contentId?.credits || 0;

      // console.log("Processing progress:", {
      //   assignmentId: progress.assignment_id,
      //   enrollmentId: progress.enrollment_id,
      //   contentType: progress.contentType,
      //   name: curr.name
      // });

      activity.push(curr);
    });

    res.status(200).json({
      success: true,
      message: "User activity fetched successfully",
      data: activity
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user activity",
      error: error.message
    });
  }
}

module.exports = {
  getUserActivity
}