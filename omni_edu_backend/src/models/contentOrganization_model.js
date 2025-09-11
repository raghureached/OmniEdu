const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const organizationContentSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    content_id: {
      type: String,
      required: true,
      ref: "Content",
    },
    organization_id: {
      type: String,
      required: true,
      ref: "Organization",
    },
    pushed_by: {
      type: String,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Pending", "Published", "Archived"],
      default: "Pending",
    },
    push_date: {
      type: Date,
      default: Date.now,
    },
    custom_content: {
      type: String,
      default: null,
    },
    last_modified: {
      type: Date,
      default: Date.now,
    },
    classification:{
      type:String,
      enum:["Initial Training","Advanced Training","Specialized Training"],
      default:"Intial Training"
    },
    team_id:{
      type:String,
      ref:"Team"
    },
    version:{
      type:Number,
      default:1
    }
  },
  {
    timestamps: true,
  },{versionKey:'version'}  
);

const OrganizationContent = mongoose.model(
  "OrganizationContent",
  organizationContentSchema
);

module.exports = OrganizationContent;
