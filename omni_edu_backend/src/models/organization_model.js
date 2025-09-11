const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo_url: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      required: true,
      default: "Active",
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
    },
    planName: {
      type: String,
      default: null,
    },
    planId: {
      type: String,
      default: null,
    },
    start_date: {
      type: Date,
    },
    end_date: {
      type: Date,
    },
    documents: {
      type: [String], 
      default: [],
    },
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
