const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const adminActivitySchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["add", "edit", "delete", "view", "login", "logout"],
      required: true,
    },
    details: {
      type: String,
      default: null, // not always required
    },
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    timeStamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const OrganizationActivity = mongoose.model("AdminActivity", adminActivitySchema);
module.exports = OrganizationActivity;
