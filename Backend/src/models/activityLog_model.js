const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const activityLogSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true,
    },
    userRole:{
        type:String,
        required:true
    },
    Date:{
        type:Date,
        required:true
    },
    action:{
        type:String,
        enum:["Create","Update","Delete","View"],
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    details:{
        type:String,
        default:null
    },
    ip:{
        type:String,
        default:'unknown'
    },
    userAgent:{
        type:String,
        default:'unknown'
    },
    status:{
        type:String,
        enum:["success", "failed"],
        default:"success"
    }
})

const ActivityLog = new mongoose.model("Activity Log", activityLogSchema);
module.exports = ActivityLog;