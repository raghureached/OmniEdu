const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const forUserMessageSchema = new mongoose.Schema(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      index:true
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Organization",
    },
    message_text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inactive"],
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // creates createdAt and updatedAt fields
  }
);

const ForUserMessage = mongoose.model("ForUserMessage", forUserMessageSchema);

module.exports = ForUserMessage;
