

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveySchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  }, organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Organization",
  },
  title: {
    type: String,
    required: true,
  },
  description: { type: String },
  sections: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "OrganizationSurveySection"
  },

  // Tagging and configuration (aligns with controllers and frontend)
  tags: { type: [String], default: [] },              // create endpoint requires tags; you can set required: true if you want DB-level enforcement
  // can set required: true if desired
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },         // can set required: true if desired
  subteam: { type: mongoose.Schema.Types.ObjectId, ref: "SubTeam" },   // can set required: true if desired
  thumbnail: { type: String },
  noOfSections:{type: Number},
  noOfQuestions:{type: Number},

  // Status and meta
  status: {
    type: String,
    enum: ["Published", "Draft", "Saved"],
    default: "Draft",
  },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
}, { timestamps: true, versionKey: "version" });
surveySchema.index({ organization_id: 1, uuid: 1 }, { unique: true });


const OrganizationSurveys = mongoose.model("OrganizationSurvey", surveySchema);

module.exports = OrganizationSurveys;
