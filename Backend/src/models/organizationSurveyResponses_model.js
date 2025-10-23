const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveyResponseSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    survey_assignment_id: {
      type: String,
      ref: "SurveyAssignment",
      required: true,
    },
    user_id: {
      type: String,
      ref: "User",
      required: true,
    },
    responses: {
      type: mongoose.Schema.Types.Mixed, // stores JSON-formatted answers (array, object, etc.)
      required: true,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const OrganizationSurveyResponses = mongoose.model("OrganizationSurveyResponses", surveyResponseSchema);

module.exports = OrganizationSurveyResponses;
