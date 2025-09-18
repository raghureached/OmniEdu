const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const organizationMessageSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    organization_id: {
      type: String,
      required: true,
      ref: "Organization", // Reference to organizations collection
    },
    message_text: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: String,
      ref: "User", // Reference to users collection
    },
  },
  {
    timestamps: true,
  }
);

const OrganizationMessage = mongoose.model(
  "OrganizationMessage",
  organizationMessageSchema
);

module.exports = OrganizationMessage;
