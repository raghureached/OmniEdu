const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    version: {
      type: String,
      default: "1.0",
    },
    description: {
      type: String,
      default: null,
    },
    questions: {
      type:[mongoose.Schema.Types.ObjectId],
      ref:"OrganizationSurveyQuestion",
      required:true
    },  
    created_by: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const OrganizationSurvey = mongoose.model("OrganizationSurvey", surveySchema);

module.exports = OrganizationSurvey;
