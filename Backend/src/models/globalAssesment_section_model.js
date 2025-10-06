const mongoose = require("mongoose");

const globalAssesmentSectionSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GlobalQuestion",
      },
    ],
  });

const GlobalAssesmentSection = mongoose.model("GlobalAssesmentSection", globalAssesmentSectionSchema);
module.exports = GlobalAssesmentSection;
