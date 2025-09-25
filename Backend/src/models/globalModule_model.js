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
    type: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: null,
    },
    video_url: {
      type: String,
      default: null,
    },
    doc_url:{
      type: [String],
      default: null,
    },
    additional_resources:{
      type: [String],
      default: []
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
      type: String,
      ref: "Users",
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
