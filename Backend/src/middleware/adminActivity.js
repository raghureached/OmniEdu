const mongoose = require("mongoose");
const ActivityLog = require("../models/adminActivity_model");

const logActivity = async (req,res,next)=>{
    res.on("finish",async ()=>{
        console.log(req.method,req.url)
        try {
            const activity = new ActivityLog({
            admin:req.user._id,
            action:req.method,
            details:req.url,
            IP:req.ip,
        })
        await activity.save();
        } catch (error) {
            console.log(error)
        }
    })
    next();
}

module.exports = logActivity
