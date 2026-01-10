const mongoose = require("mongoose");
const {v4: uuidv4} = require("uuid");

const AdminSurveySectionSchema = new mongoose.Schema({
    uuid: {
        type: String,
        default: uuidv4,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "OrganizationSurveyQuestion",
        required: true
    }
});

const OrganizationSurveySection = mongoose.model("OrganizationSurveySection", AdminSurveySectionSchema);

module.exports = OrganizationSurveySection;