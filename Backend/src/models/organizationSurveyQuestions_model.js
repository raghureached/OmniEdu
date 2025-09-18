const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveyQuestionSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    question_text: {
      type: String,
      required: true,
      trim: true,
    },
    question_type: {
      type: String,
      required: true,
      enum: ["text", "rating", "multiple_choice"],
    },
    options: {
      type: mongoose.Schema.Types.Mixed, // to store JSON (JSONB equivalent)
      default: null,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, 
  }
);

const OrganizationSurveyQuestion = mongoose.model("OrganizationSurveyQuestion", surveyQuestionSchema);

module.exports = OrganizationSurveyQuestion;
