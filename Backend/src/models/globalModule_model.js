const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const GlobalModuleSchema = new mongoose.Schema(
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
    tags:{
      type: [String],
      default: []
    },
    primaryFile: {
      type: String,
      default: null,
    },
    additionalFile: {
      type: String,
      default: null,
    },
    trainingType: {
      type: String,
      default: null,
    },
    team: {
      type: String,
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
    enableFeedback: {
      type: Boolean,
      default: false,
    },
    externalResource: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    learning_outcomes:{
      type: [String],
      default: []
    },
    pushable_to_orgs: {
      type: Boolean,
      default: true,
    },
    credits: {
      type: Number,
      default: 2,
    },
    duration: {
      type: Number,
      default: 0,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GlobalAdmin",
      default: null,
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

const GlobalModule = mongoose.model("GlobalModule", GlobalModuleSchema);

module.exports = GlobalModule;
