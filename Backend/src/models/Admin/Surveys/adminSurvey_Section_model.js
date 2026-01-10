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
        ref: "AdminSurveyQuestion",
        required: true
    }
});

const AdminSurveySection = mongoose.model("AdminSurveySection", AdminSurveySectionSchema);

module.exports = AdminSurveySection;