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
      enum: ["OrganizationModule", "OrganizationAssessments", "OrganizationSurvey", "LearningPath","OrganizationDocument","ScormModule"]
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "assign_type"
    },
    // optional metadata about the content
    contentType: { type: String, default: null },
    contentName: { type: String, default: null },
    assigned_users: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User"
    },
    name: { type: String, required: false, trim: true },
    assign_on: { type: Date, default: Date.now },
    due_date: { type: Date, required: false },
    assignTime: { type: String, default: null },
    dueTime: { type: String, default: null },
    notify_users: { type: Boolean, default: true },
    isRecurring: { type: Boolean, default: false },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groups:{
      type:[mongoose.Schema.Types.ObjectId],
      default:[],
      ref:"Team"
    },
    // frontend-aligned additional fields
    bulkEmails: { type: [String], default: [] },
    enableReminder: { type: Boolean, default: false },
    resetProgress: { type: Boolean, default: false },
    recurringInterval: { type: String, default: "" },
    customIntervalValue: { type: Number, default: 0 },
    customIntervalUnit: { type: String, default: "days" },
    orgAssignment: { type: Boolean, default: true },
    elementSchedules: [
      {
        elementId: { type: mongoose.Schema.Types.ObjectId, required: true },
        assign_on: { type: Date, default: null },
        due_date: { type: Date, default: null },
        _id: false
      }
    ],
    
  },
  { timestamps: true }
);

const ForUserAssignment = mongoose.model("ForUserAssignment", assignmentSchema);

module.exports = ForUserAssignment