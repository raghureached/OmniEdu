const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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
  { timestamps: true }
);

// Ensure virtuals are included when converting documents to JSON/objects
teamSchema.set("toObject", { virtuals: true });
teamSchema.set("toJSON", { virtuals: true });

// Virtual to populate sub-teams for a team
teamSchema.virtual("subTeams", {
  ref: "SubTeam",
  localField: "_id",
  foreignField: "team_id",
  justOne: false,
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
