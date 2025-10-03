// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// const surveySchema = new mongoose.Schema(
//   {
//     uuid: {
//       type: String,
//       default: uuidv4,
//       unique: true,
//       index: true,
//     },
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       default: null,
//     },
//     questions: {
//       type:[mongoose.Schema.Types.ObjectId],
//       ref:"GlobalSurveyQuestion",
//       required:true
//     },
//     survey_type: {
//       type: String,
//       enum: ["Multiple Choice","Multi  Choice"],
//       required: true,
//     },
//     // NEW: classification fields to mirror assessments usage
//     tags: {
//       type: [String],
//       default: [],
//     },
//     team: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     subteam: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     start_date: {
//       type: Date,
//       default: null,
//     },
//     end_date: {
//       type: Date,
//       default: null,
//     },
//     is_active: {
//       type: Boolean,
//       default: true,
//     },
//     created_by: {
//       type: String,
//       ref: "User",
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Surveys = mongoose.model("GlobalSurveys", surveySchema);

// module.exports = Surveys;


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

  // Questions
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalSurveyQuestion",
    },
  ],

  // Optional feedback block attached to the survey
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
