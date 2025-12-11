const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      default: () => `USER-${uuidv4().slice(0, 8)}`,
      unique: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true, // Each org sees only its own tickets
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // userId
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserTicket", userTicketSchema);
