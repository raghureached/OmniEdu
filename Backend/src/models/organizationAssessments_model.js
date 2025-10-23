

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OrgAssessmentsSchema = new mongoose.Schema({
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
  description: { type: String , required: true,},
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationAssessmentQuestion"
    }
  ],
  instructions:{
    type:String,
    default:null
  },
  // Tagging and configuration (aligns with controllers and frontend)
  tags: { type: [String], default: [], required: true, },              // create endpoint requires tags; you can set required: true if you want DB-level enforcement
  duration: { type: Number, default: 0, required: true, },                         // can set required: true if desired
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" , required: true,},         // can set required: true if desired
  subteam: { type: mongoose.Schema.Types.ObjectId, ref: "SubTeam", required: true, },   // can set required: true if desired
  attempts: { type: Number, default: 1, required: true, },
  unlimited_attempts: { type: Boolean, default: false, required: true, },
  percentage_to_pass: { type: Number, min: 0, max: 100, default: 0 , required: true,},
  // display_answers: { type: Boolean, default: false },
  display_answers: {
    type: String,
    enum: ["AfterAssessment", "AfterPassing",  "Never"],
    default: "AfterPassing",
  },
  thumbnail_url:{
    type:String,
    default:null
  },
  // Status and meta
  status: {
    type: String,
    enum: ["Published", "Draft", "Saved"],
    default: "Draft",
  },  
  credits: {
    type: Number,
    default: 2,
  },
  category: {
    type: String,
    default: null,
  },
  badges: {
    type: Number,
    default: 2,
  },
  stars: {
    type: Number,
    default: 2,
  },
  feedbackEnabled: {
    type: Boolean,
    default: false,
  },
  shuffle_questions:{
    type: Boolean,
    default: false,
  },
  shuffle_options:{
    type: Boolean,
    default: false,
  }
  ,
  // classification: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  version: { type: Number, default: 1 },
}, { timestamps: true, versionKey: "version" });

const OrganizationAssessments = mongoose.model("OrganizationAssessments", OrgAssessmentsSchema);
module.exports = OrganizationAssessments;