const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const organizationAssignmentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    assignment_id: {
      type: String,
      required: true,
      ref: "Assignment",
    },
    organization_id: {
      type: String,
      required: true,
      ref: "Organization",
    },
    assigned_by: {
      type: String,
      ref: "User",
    },
    assigned_at: {
      type: Date,
      default: Date.now,
    },
    due_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Assigned", "In Progress", "Completed"],
      default: "Assigned",
    },
  },
  {
    timestamps: true,
  }
);

const OrganizationAssignments = mongoose.model(
  "OrganizationAssignments",
  organizationAssignmentSchema
);

module.exports = OrganizationAssignments;
