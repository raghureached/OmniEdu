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
