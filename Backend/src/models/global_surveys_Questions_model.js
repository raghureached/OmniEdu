

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const surveyQuestionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Multiple Choice", "Multi Select", "info"],
    required: true
  },
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  }
  , instruction_text: { type: String, default: '' },
  options: {
    type: [String],
    required: function () { return this.type !== 'info'; },
    validate: {
      validator: function (arr) {
        if (this.type === 'info') return true;
        return Array.isArray(arr) && arr.filter(Boolean).length >= 2;
      },
      message: "At least two options are required"
    },
    default: []
  },
  order: { type: Number, default: 0, index: true },
});

// Keep the combined 'instructions' in sync if header/text are edited from the UI
surveyQuestionSchema.pre('save', function (next) {
  try {
    const text = (this.instruction_text || '').trim();
    const combined = [text].filter(Boolean).join('\n\n');
    if (this.isModified('instruction_text')) {
      this.instructions = combined;
    }
    next();
  } catch (e) {
    next(e);
  }
});
const GlobalSurveyQuestion = mongoose.model("GlobalSurveyQuestion", surveyQuestionSchema);

module.exports = GlobalSurveyQuestion;