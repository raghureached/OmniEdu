

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveySchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: { type: String },
  sections:{
    type: [mongoose.Schema.Types.ObjectId],
    ref:"GlobalSurveySection"
    },
  feedback: { type: mongoose.Schema.Types.ObjectId, ref: "GlobalSurveyFeedback", default: null },

  // Tagging and configuration (aligns with controllers and frontend)
  tags: { type: [String], default: [] },              // create endpoint requires tags; you can set required: true if you want DB-level enforcement
                     // can set required: true if desired
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },         // can set required: true if desired
  subteam: { type: mongoose.Schema.Types.ObjectId, ref: "SubTeam" },   // can set required: true if desired
  

  // Status and meta
  status: {
    type: String,
    enum: ["Published", "Draft", "Archived"],
    default: "Draft",
  },

  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true, versionKey: "version" });

const Surveys = mongoose.model("GlobalSurveys", surveySchema);

module.exports = Surveys;
