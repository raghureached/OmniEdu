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
      type: mongoose.Schema.Types.ObjectId,
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
    permissions: [
        {
          section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
          allowed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }]
        }
      ]
  },
  {
    timestamps: true,
  }
);

const OrganizationRole = mongoose.model(
  "OrganizationRole",
  organizationRoleSchema
);

module.exports = OrganizationRole;
