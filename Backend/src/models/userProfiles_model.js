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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // designation_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Designation",
    // },
    designation:{
      type:String,
      default:null
    },
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    sub_team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubTeam",
    },
    teams: [
      {
        team_id: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        sub_team_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubTeam", default: null },
        _id: false,
      },
    ],
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
    custom1: {
      type: String,
      default: null,
      trim: true,
    },
    stars:{
      type: Number,
      default: 0,
    },
    badges: {
      type: Number,
      default: 0,
    },
    credits: {
      type: Number,
      default: 0,
    },

  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
