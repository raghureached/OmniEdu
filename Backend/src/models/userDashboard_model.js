const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userDashboardSettingsSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
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
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization", // Reference to the Organizations collection
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const UserDashboardSettings = mongoose.model(
  "UserDashboardSettings",
  userDashboardSettingsSchema
);

module.exports = UserDashboardSettings;
