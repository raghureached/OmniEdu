
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const enrollmentSchema = new mongoose.Schema(
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
      enum: ["GlobalModule", "GlobalAssessments", "GlobalSurvey"]
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "assign_type"
    },
    contentType: { type: String, default: null },
    contentName: { type: String, default: null },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: false, trim: true },
    assign_on: { type: Date, default: Date.now },
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

const Enrollments = mongoose.model("Enrollments", enrollmentSchema);

module.exports = Enrollments
