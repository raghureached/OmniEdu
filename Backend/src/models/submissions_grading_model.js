const mongoose = require("mongoose")

const submissionGradingSchema = new mongoose.Schema({
    gradedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    gradedAt:{
        type: Date,
        default: Date.now
    },
    grade:{
        type: Number,
        default: 0
    },
    feedback:{
        type: String,
        default: ""
    },
    submissionId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Submission"
    }
}) 

const submissionGradingModel = mongoose.model("SubmissionGrading", submissionGradingSchema)
module.exports = submissionGradingModel 