const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const globalAssignmentSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true,
    },
    assignDate: {
        type: Date,
        required: true,
    },
    assignTime: {
        type: String,
        required: true,
    },
    ModuleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobalModule",
    },
    surveyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobalSurveys",
    },
    assessmentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobalAssessments",
    },
    contentName: {
        type: String,
        required: true,
    },
    dueTime: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    isRecurring: {
        type: Boolean,
        required: true,
    },
    orgId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
})

const GlobalAssingnment = mongoose.model("GlobalAssignment", globalAssignmentSchema);
module.exports = GlobalAssingnment;