const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userProfileSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      ref: "User",
      required: true,
    },
    designation_id: {
      type: String,
      ref: "Designation",
      required: true,
    },
    organization_roles_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizationRole",
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    sub_team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubTeam",
      required: true,
    },
    custom_group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomGroup",
      default: null,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Department"
    },
    employee_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
