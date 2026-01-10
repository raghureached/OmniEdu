

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const surveyQuestionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Multiple Choice", "Multi Select","info"],
    required: true
  },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  
  options: {
    type: [String],
    required: true,
    validate: [arr => arr.length >= 2, "At least two options are required"]
  },
  order: { type: Number, default: 0, index: true },
});
const OrganizationSurveyQuestion = mongoose.model("OrganizationSurveyQuestion", surveyQuestionSchema);

module.exports = OrganizationSurveyQuestion;