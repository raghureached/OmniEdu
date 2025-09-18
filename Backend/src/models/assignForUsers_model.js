const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const assignmentUserSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    assignment_id: {
      type: String,
      required: true,
      ref: "ForUserAssignment",
    },
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      default: "Assigned",
      enum: ["Assigned", "In Progress", "Completed", "Overdue"], // example statuses; adjust if needed
    },
    submitted_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const AssignForUser = mongoose.model("AssignForUser", assignmentUserSchema);

module.exports = AssignForUser;
