const UserContentProgress = require("../../models/userContentProgress_model")
const UserProfile = require("../../models/userProfiles_model")



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


module.exports = { getContentStats, getUserRewards }
