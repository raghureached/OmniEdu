const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const userProgressSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForUserAssignment",
      required: true,
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "overdue"],
      default: "not_started",
    },
    progress_percent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    score: {
      type: Number, // useful for assessments
    },
    attempts: {
      type: Number,
      default: 0,
    },
    last_accessed: {
      type: Date,
      default: Date.now,
    },
    completed_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
module.exports = UserProgress;
