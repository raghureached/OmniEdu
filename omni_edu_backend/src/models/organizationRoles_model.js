const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const organizationRoleSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure no duplicate role names within the same organization
//organizationRoleSchema.index({ organization_id: 1, name: 1 }, { unique: true });

const OrganizationRole = mongoose.model(
  "OrganizationRole",
  organizationRoleSchema
);

module.exports = OrganizationRole;
