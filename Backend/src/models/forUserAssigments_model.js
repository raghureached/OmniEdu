const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const assignmentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },

    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    assign_type: {
      type: String,
      required: true,
      enum: ["Module", "Assessment", "Survey", "LearningPath"]
    },

    assign_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "assign_type", // <-- dynamic reference
    },
    assigned_users:{
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref:"User"
    },
    name: { type: String, required: true, trim: true },
    assign_on: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    notify_users: { type: Boolean, default: true },
    recursive: { type: Boolean, default: false },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ForUserAssignment = mongoose.model("ForUserAssignment", assignmentSchema);

module.exports=ForUserAssignment