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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    content_url: {
      type: String, // S3 or similar URL
    },
    assignment_type: {
      type: String,
      enum: ["PDF", "Document", "Task", "Training"],
      required: true,
    },
    type_assignment: {
      type: String,
      enum: ["MANDATORY", "OPTIONAL", "Additional"],
      required: true,
    },
    created_by: {
      type: String,
      ref: "User",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Assignments = mongoose.model("Assignments", assignmentSchema);

module.exports = Assignments;


// const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");

// const assignmentSchema = new mongoose.Schema(
//   {
//     id: {
//       type: String,
//       default: uuidv4,
//       unique: true,
//     },
//     organization_id: {
//       type: String,
//       required: true,
//       ref: "Organizations",
//     },
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200,
//     },
//     classification: {
//       type: String,
//       trim: true,
//       maxlength: 100,
//       default: null,
//     },
//     status: {
//       type: String,
//       enum: ["Draft", "Published", "Archived"],
//       default: "Draft",
//     },
//     version: {
//       type: String,
//       default: "1.0",
//     },
//     total_questions: {
//       type: Number,
//       default: 0,
//     },
//     description: {
//       type: String,
//       default: null,
//     },
//     created_by: {
//       type: String,
//       ref: "Users",
//       default: null,
//     },
//     updated_by: {
//       type: String,
//       ref: "Users",
//       default: null,
//     },
//   },
//   {
//     timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
//   }
// );

// const Assignment = mongoose.model("Assignment", assignmentSchema);

// module.exports = Assignment;

