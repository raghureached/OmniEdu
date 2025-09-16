const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const designationSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    organization_id: {
      type: String,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    created_by: {
      type: String,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: prevent duplicate designation names under same organization
//designationSchema.index({ organization_id: 1, name: 1 }, { unique: true });

const Designation = mongoose.model("Designation", designationSchema);

module.exports = Designation;
