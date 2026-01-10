const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const commentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },

  sender: {
    type: String,
    enum: ["Admin", "GlobalAdmin"],
    required: true,
  },

  senderId: {
    type: String, // or mongoose.Schema.Types.ObjectId IF you store ObjectIds
    required: true,
  },

  senderName: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    default: "",
  },

  attachments: [
    {
      fileName: String,
      size: String,
      url: String, // optional future use
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const adminTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => `ADM-${uuidv4().slice(0, 8)}`,
      unique: true,
    },

    organizationId: {
      type: String,
      required: true,
    },

    createdBy: {
      type: String, // adminId
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    errorMessage: {
      type: String,
      default: "",
    },

    attachments: [
      {
        fileName: String,
        size: String,
      },
    ],

    status: {
      type: String,
      enum: ["Open", "In-Progress", "Resolved"],
      default: "Open",
    },

    // ⭐ ADD THIS NEW FIELD ⭐
    conversation: [commentSchema],  // <------ MOST IMPORTANT CHANGE
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminTicket", adminTicketSchema);
