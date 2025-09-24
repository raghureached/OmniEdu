// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// const surveyQuestionSchema = new mongoose.Schema(
//   {
//     uuid: {
//       type: String,
//       default: uuidv4,
//       unique: true,
//       index:true
//     },
//     question_text: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     question_type: {
//       type: String,
//       required: true,
//       enum: ["multiple_choice"],
//     },
//     options: {
//       type: mongoose.Schema.Types.Mixed, // to store JSON (JSONB equivalent)
//       default: null,
//     },
//     position: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true, 
//   }
// );

// const GlobalSurveyQuestion = mongoose.model("GlobalSurveyQuestion", surveyQuestionSchema);

// module.exports = GlobalSurveyQuestion;


const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const surveyQuestionSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    question_type: {
      type: String,
      required: true,
      enum: ["multiple_choice", "info"], // add "info" type
    },
    question_text: {
      type: String,
      trim: true,
      required: function () {
        return this.question_type === "multiple_choice";
      },
    },
    info_text: {
      type: String,
      trim: true,
      required: function () {
        return this.question_type === "info";
      },
    },
    options: {
      type: mongoose.Schema.Types.Mixed, // only for multiple_choice
      default: null,
    },
    position: {
      type: Number,
      default: 0, // use to maintain order
    },
  },
  {
    timestamps: true,
  }
);

const GlobalSurveyQuestion = mongoose.model(
  "GlobalSurveyQuestion",
  surveyQuestionSchema
);

module.exports = GlobalSurveyQuestion;

