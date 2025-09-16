const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const contentSchema = new mongoose.Schema(
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
    type: {
      type: String,
      required: true,
    },
    content: {
      type: String, // For theory-based text content
      default: null,
    },
    file_url: {
      type: String, // S3 or external URL
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    pushable_to_orgs: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: String,
      ref: "Users",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
