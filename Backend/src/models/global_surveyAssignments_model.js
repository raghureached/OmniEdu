const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveyAssignmentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    survey_id: {
      type: String,
      ref: "Survey",
      required: true,
    },
    organization_id: {
      type: String,
      ref: "Organization",
      required: true,
    },
    assigned_by: {
      type: String,
      ref: "Users",
      required: true,
    },
    assignment_date: {
      type: Date,
      default: Date.now,
    },
    survey_status: {
      type: String,
      enum: ["Pending", "Active", "Completed"],
      default: "Pending",
    },
    responses_deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SurveyAssignments = mongoose.model(
  "SurveyAssignments",
  surveyAssignmentSchema
);

module.exports = SurveyAssignments;
