const mongoose = require("mongoose");
const {v4: uuidv4} = require("uuid");

const globalSurveySectionSchema = new mongoose.Schema({
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
        ref: "GlobalSurveyQuestion",
        required: true
    }
});

const GlobalSurveySection = mongoose.model("GlobalSurveySection", globalSurveySectionSchema);

module.exports = GlobalSurveySection;