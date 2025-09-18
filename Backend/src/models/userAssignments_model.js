const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userAssignmentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    org_assignment_id: {
      type: String,
      required: true,
      ref: "OrganizationAssignment",
    },
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    assigned_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "Completed", "Overdue"],
      default: "Assigned",
    },
    completed_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserAssignments = mongoose.model("UserAssignments", userAssignmentSchema);

module.exports = UserAssignments;
