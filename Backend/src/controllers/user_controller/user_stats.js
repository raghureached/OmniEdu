const Notification = require("../../models/Notification_model")
const UserContentProgress = require("../../models/User/userContentProgress_model")
const UserProfile = require("../../models/User/userProfiles_model")



const getContentStats = async(req,res)=>{
    try {
        const progress = await UserContentProgress.find({ user_id: req.user._id })
        const stats = {
            enrolled : progress.length,
            completed : progress.filter((p)=>p.status==="completed").length,
            in_progress : progress.filter((p)=>p.status==="in_progress").length,
            expired : progress.filter((p)=>p.status==="expired").length
        }
        return res.status(200).json({
            isSuccess: true,
            message: "Content stats fetched successfully",
            data: stats
        })
    } catch (error) {
        console.log(error)
    }
}

const getUserRewards = async(req,res) =>{
    try {
        const rewards = await UserProfile.findOne({ user_id: req.user._id }).select("stars badges credits")
        return res.status(200).json({
            isSuccess: true,
            message: "User rewards fetched successfully",
            data: rewards
        })
    } catch (error) {
        // console.log(error)
        return res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch user rewards",
            error: error.message
        })
    }

}

const getNotification = async(req,res) =>{
    try {
        const notifications = await Notification.find({ to: req.user._id }).sort({ createdAt: -1 })
        return res.status(200).json({
            isSuccess: true,
            message: "Notifications fetched successfully",
            data: notifications
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = { getContentStats, getUserRewards,getNotification }

// Mark a single notification as read for the current user
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Notification ID is required",
      });
    }

    // Ensure the notification belongs to the authenticated user
    const updated = await Notification.findOneAndDelete(
      { _id: notificationId, to: req.user._id },
    ).lean();

    if (!updated) {
      return res.status(404).json({
        isSuccess: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      isSuccess: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

module.exports.markNotificationAsRead = markNotificationAsRead;
