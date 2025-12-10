const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userContentProgressSchema = new mongoose.Schema(
  {
    uuid: { type: String, default: uuidv4, unique: true, index: true },
    organization_id: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: "ForUserAssignment"},
    enrollment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollments" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    contentType: { type: String, required: true },
    status: { type: String, enum: ["assigned", "in_progress", "completed", "expired","enrolled"], default: "assigned" },
    progress_pct: { type: Number, min: 0, max: 100, default: 0 },
    started_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
    last_activity_at: { type: Date, default: null },

    elements: [
      {
        elementId: { type: mongoose.Schema.Types.ObjectId, required: true },
        status: { type: String, enum: ["locked", "assigned", "in_progress", "completed", "expired"], default: "locked" },
        assign_on: { type: Date, default: null },
        due_date: { type: Date, default: null },
        started_at: { type: Date, default: null },
        completed_at: { type: Date, default: null },
        progress_pct: { type: Number, min: 0, max: 100, default: 0 },
        _id: false,
      },
    ],
    orgAssignment: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userContentProgressSchema.index({ assignment_id: 1, user_id: 1 }, { unique: true });

const UserContentProgress = mongoose.model("UserContentProgress", userContentProgressSchema);

module.exports = UserContentProgress;
