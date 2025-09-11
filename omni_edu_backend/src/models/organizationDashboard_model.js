const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const organizationDashboardSettingsSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    organization_id: {
      type: String,
      required: true,
      ref: "Organization", // Reference to the Organizations collection
    },
    feature_key: {
      type: String,
      required: true,
      trim: true,
    },
    is_enabled: {
      type: Boolean,
      default: true,
    },
    updated_by: {
      type: String,
      ref: "User", // Reference to the Users collection
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps:true,
  }
);

const OrganizationDashboardSettings = mongoose.model(
  "OrganizationDashboardSettings",
  organizationDashboardSettingsSchema
);

module.exports = OrganizationDashboardSettings;
