const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const organizationAssessmentsAttempsSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationAssessments",
      required: true,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
    },
    result: {
      type: String,
      enum: ["pass", "fail"],
    },
  },
  { timestamps: true }
);

const OrganizationAssessmentsAttemps = mongoose.model("OrganizationAssessmentsAttemps", organizationAssessmentsAttempsSchema);
module.exports = OrganizationAssessmentsAttemps;