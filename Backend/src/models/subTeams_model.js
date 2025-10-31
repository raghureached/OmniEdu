const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const subTeamSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Team",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    membersCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Unique index to prevent duplicate sub-team names within the same team
//subTeamSchema.index({ team_id: 1, name: 1 }, { unique: true });

const SubTeam = mongoose.model("SubTeam", subTeamSchema);

module.exports = SubTeam;
