const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    questions: {
      type:[mongoose.Schema.Types.ObjectId],
      ref:"GlobalSurveyQuestion",
      required:true
    },
    survey_type: {
      type: String,
      enum: ["Multiple Choice", "Short Answer", "Rating"],
      required: true,
    },
    start_date: {
      type: Date,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: String,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Surveys = mongoose.model("GlobalSurveys", surveySchema);

module.exports = Surveys;
