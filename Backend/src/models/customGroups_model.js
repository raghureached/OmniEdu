const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const customGroupSchema = new mongoose.Schema(
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
      ref: "Organization",
    },
    team_id: {
      type: String,
      required: true,
      ref: "Teams",
    },
    sub_team_id: {
      type: String,
      required: true,
      ref: "SubTeam",
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
      ref: "Users",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound unique index to prevent duplicate group names under the same org + team + subteam
// customGroupSchema.index(
//   { organization_id: 1, team_id: 1, sub_team_id: 1, name: 1 },
//   { unique: true }
// );

const CustomGroup = mongoose.model("CustomGroup", customGroupSchema);

module.exports = CustomGroup;
