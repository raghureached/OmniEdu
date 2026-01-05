const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ScormModuleSchema = new mongoose.Schema({
  entryPoint: String,
  scormPath: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: "Draft" },
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
  tags: {
    type: [String],
    default: []
  },

  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  subteam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubTeam",
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  badges: {
    type: String,
    default: null,
  },
  stars: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  learning_outcomes: {
    type: [String],
    default: []
  },
  credits: {
    type: Number,
    default: 2,
  },
  prerequisites: {
    type: [String],
    default: [],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  thumbnail: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["Published", "Draft"],
    default: "Draft",
  },
}, { timestamps: true });

module.exports = mongoose.model("ScormModule", ScormModuleSchema);