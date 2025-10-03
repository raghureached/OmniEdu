 const mongoose = require("mongoose");
 const { v4: uuidv4 } = require("uuid");

// Feedback block attached to a survey
// Contains optional top/bottom instructions and a central input text
const feedbackSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    instructionTop: { type: String, default: "" },
    instruction_header_top: { type: String, default: "" },
    question_text: { type: String, default: "" },
    instructionBottom: { type: String, default: "" },
   // instruction_header_bottom: { type: String, default: "" },
    // optional references for traceability (not required for usage)
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const GlobalSurveyFeedback = mongoose.model("GlobalSurveyFeedback", feedbackSchema);
module.exports = GlobalSurveyFeedback;
